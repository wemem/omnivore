import { In } from 'typeorm'
import {
  FetchContentType,
  Subscription,
  SubscriptionType,
} from '../../../entity/subscription'
import { env } from '../../../env'
import {
  QuerySearchSubscriptionsArgs,
  SubscribeErrorCode,
} from '../../../generated/graphql'
import { getRepository } from '../../../repository'
import { validateUrl } from '../../../services/create_page_save_request'
import { analytics } from '../../../utils/analytics'
import { authorized } from '../../../utils/gql-utils'
import { parseFeed } from '../../../utils/parser'
import { keysToCamelCase } from '../../../utils/helpers'

const COMMON_USER_ID = '00000000-0000-0000-0000-000000000000'

export const searchSubscriptionsResolver = authorized<
  Array<Subscription>,
  { errorCodes: string[] },
  QuerySearchSubscriptionsArgs
>(async (_obj, params, { uid, log }) => {
  analytics.capture({
    distinctId: uid,
    event: 'searchSubscriptions',
    properties: {
      ...params,
      env: env.server.apiEnv,
    },
  })

  const keyword = params.keyword.trim()
  if (keyword.length == 0) {
    return []
  }

  // 如果关键字是个网址，那么验证这个网址是否合法
  if (keyword.startsWith('http:') || keyword.startsWith('https:')) {
    try {
      validateUrl(keyword)
    } catch (error) {
      log.error('invalid feedUrl', { keyword, error })
      return {
        errorCodes: [SubscribeErrorCode.BadRequest],
      }
    }

    // validate rss feed
    const feed = await parseFeed(keyword)
    if (!feed) {
      return {
        errorCodes: [SubscribeErrorCode.NotFound],
      }
    }

    // 使用事务和行锁来防止并发插入
    const queryRunner =
      getRepository(Subscription).manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 查找现有订阅，并加行锁
      const existingSubscription = await queryRunner.manager.findOne(
        Subscription,
        {
          where: {
            url: In([feed.url, keyword]),
            user: { id: COMMON_USER_ID },
            type: SubscriptionType.Rss,
          },
          lock: { mode: 'pessimistic_write' },
        }
      )

      if (existingSubscription) {
        await queryRunner.commitTransaction()
        return [existingSubscription]
      }

      // 直接插入新的订阅
      const results = (await queryRunner.query(
        `insert into omnivore.subscriptions (name, url, description, type, user_id, icon, is_private, fetch_content_type, folder, status) 
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            returning *;`,
        [
          feed.title,
          feed.url,
          feed.description,
          SubscriptionType.Rss,
          COMMON_USER_ID,
          feed.thumbnail,
          undefined,
          FetchContentType.Always,
          'following',
          'UNSUBSCRIBED',
        ]
      )) as any[]

      if (results.length === 0) {
        await queryRunner.rollbackTransaction()
        return {
          errorCodes: [SubscribeErrorCode.BadRequest],
        }
      }

      // convert to camel case
      const newSubscription = keysToCamelCase(results[0]) as Subscription

      await queryRunner.commitTransaction()
      return [newSubscription]
    } catch (error) {
      await queryRunner.rollbackTransaction()
      log.error('Failed to insert new subscription', error)
      return {
        errorCodes: [SubscribeErrorCode.BadRequest],
      }
    } finally {
      await queryRunner.release()
    }
  }

  const subscriptions = (await getRepository(Subscription).query(
    `select DISTINCT ON (url) * from omnivore.subscriptions where user_id = $1 and (name ilike $2 or url ilike $2) limit 10`,
    [COMMON_USER_ID, `%${keyword}%`]
  )) as Subscription[]

  return (subscriptions || []).map(keysToCamelCase) as Subscription[]
})
