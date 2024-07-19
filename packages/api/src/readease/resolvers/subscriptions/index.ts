import { In } from "typeorm";
import { FetchContentType, Subscription, SubscriptionType } from "../../../entity/subscription";
import { env } from "../../../env";
import { QuerySearchSubscriptionsArgs, SubscribeErrorCode } from "../../../generated/graphql";
import { getRepository } from "../../../repository";
import { validateUrl } from "../../../services/create_page_save_request";
import { analytics } from "../../../utils/analytics";
import { authorized } from "../../../utils/gql-utils";
import { parseFeed } from "../../../utils/parser";
import { keysToCamelCase } from "../../../utils/helpers";


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
    return [];
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

    // find existing subscription
    const existingSubscription = await getRepository(Subscription).findOneBy({
      url: In([feed.url, keyword]), // check both user provided url and parsed url
      user: { id: uid },
      type: SubscriptionType.Rss,
    })

    if (existingSubscription) {
      return [existingSubscription]
    }

    // create new rss subscription
    const MAX_RSS_SUBSCRIPTIONS = env.subscription.feed.max

    // limit number of rss subscriptions to max
    const results = (await getRepository(Subscription).query(
      `insert into omnivore.subscriptions (name, url, description, type, user_id, icon, is_private, fetch_content_type, folder, status) 
          select $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 from omnivore.subscriptions 
          where user_id = $5 and type = 'RSS' and status = 'ACTIVE' 
          having count(*) < $11
          returning *;`,
      [
        feed.title,
        feed.url,
        feed.description,
        SubscriptionType.Rss,
        uid,
        feed.thumbnail,
        undefined,
        FetchContentType.Always,
        'following',
        'UNSUBSCRIBED',
        MAX_RSS_SUBSCRIPTIONS,
      ]
    )) as any[]

    if (results.length === 0) {
      return {
        errorCodes: [SubscribeErrorCode.ExceededMaxSubscriptions],
      }
    }

    // convert to camel case
    const newSubscription = keysToCamelCase(results[0]) as Subscription

    return [newSubscription]
  }

  const subscriptions = await getRepository(Subscription).query(
    `select DISTINCT ON (url) * from omnivore.subscriptions where name ilike $1 or url ilike $1 limit 10`,
    [`%${keyword}%`]
  ) as Subscription[];

  return (subscriptions || []).map(keysToCamelCase) as Subscription[];
})