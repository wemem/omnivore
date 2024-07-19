import { appDataSource } from '../data_source'
import { Profile } from '../entity/profile'
import { StatusType, User } from '../entity/user'
import { env } from '../env'
import { SignupErrorCode } from '../generated/graphql'
import { createPubSubClient } from '../pubsub'
import { getRepository } from '../repository'
import { userRepository } from '../repository/user'
import { AuthProvider } from '../routers/auth/auth_types'
import { analytics } from '../utils/analytics'
import { IntercomClient } from '../utils/intercom'
import { validateUsername } from '../utils/usernamePolicy'
import { addPopularReadsForNewUser } from './popular_reads'
import { sendNewAccountVerificationEmail } from './send_emails'
import { createDefaultFiltersForUser } from './create_user'

export const MAX_RECORDS_LIMIT = 1000

export const createUserInternal = async (input: {
  userId: string
  provider: AuthProvider
  sourceUserId?: string
  email: string
  username: string
  name: string
  pictureUrl?: string
  bio?: string
  groups?: [string]
  inviteCode?: string
  password?: string
  pendingConfirmation?: boolean
}): Promise<[User, Profile]> => {
  const trimmedEmail = input.email.trim()
  const existingUser = await userRepository.findByEmail(trimmedEmail)
  if (existingUser) {
    if (existingUser.profile) {
      return Promise.reject({ errorCode: SignupErrorCode.Unknown })
    }

    // create profile if user exists but profile does not exist
    const profile = await getRepository(Profile).save({
      username: input.username,
      pictureUrl: input.pictureUrl,
      bio: input.bio,
      user: existingUser,
    })

    analytics.capture({
      distinctId: existingUser.id,
      event: 'create_user_internal',
      properties: {
        env: env.server.apiEnv,
        email: existingUser.email,
        username: profile.username,
      },
    })

    return [existingUser, profile]
  }

  const [user, profile] = await appDataSource.transaction<[User, Profile]>(
    async (t) => {
      const user = await t.getRepository(User).save({
        id: input.userId,
        source: input.provider,
        name: input.name,
        email: trimmedEmail,
        sourceUserId: input.userId,
        password: input.password,
        status: StatusType.Active,
      })
      const profile = await t.getRepository(Profile).save({
        username: input.username,
        pictureUrl: input.pictureUrl,
        bio: input.bio,
        user,
      })

      await createDefaultFiltersForUser(t)(user.id)

      return [user, profile]
    }
  )

  await addPopularReadsForNewUser(user.id)

  const customAttributes: { source_user_id: string } = {
    source_user_id: user.sourceUserId,
  }
  await IntercomClient?.contacts.createUser({
    email: user.email,
    externalId: user.id,
    name: user.name,
    avatar: profile.pictureUrl || undefined,
    customAttributes: customAttributes,
    signedUpAt: Math.floor(Date.now() / 1000),
  })

  const pubsubClient = createPubSubClient()
  await pubsubClient.userCreated(
    user.id,
    user.email,
    user.name,
    profile.username
  )

  analytics.capture({
    distinctId: user.id,
    event: 'create_user_internal',
    properties: {
      env: env.server.apiEnv,
      email: user.email,
      username: profile.username,
    },
  })

  if (input.pendingConfirmation) {
    if (!(await sendNewAccountVerificationEmail(user))) {
      return Promise.reject({ errorCode: SignupErrorCode.InvalidEmail })
    }
  }

  return [user, profile]
}
