import { env } from '../../env'
import {
  HtmlToMarkdownError,
  HtmlToMarkdownResult,
  HtmlToMarkdownSuccess,
  MutationHtmlToMarkdownArgs,
  MutationSaveFileArgs,
  MutationSavePageArgs,
  MutationSaveUrlArgs,
  PreparedDocumentInput,
  SaveError,
  SaveErrorCode,
  SaveSuccess,
} from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { saveFile } from '../../services/save_file'
import { createSlug, savePage } from '../../services/save_page'
import { saveUrl } from '../../services/save_url'
import { analytics } from '../../utils/analytics'
import { authorized } from '../../utils/gql-utils'
import { htmlToMarkdown, parsePreparedContent } from '../../utils/parser'

export const savePageResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSavePageArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'page',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return savePage(input, user)
})

export const saveUrlResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveUrlArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'url',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveUrl(input, user)
})

export const saveFileResolver = authorized<
  SaveSuccess,
  SaveError,
  MutationSaveFileArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'link_saved',
    properties: {
      url: input.url,
      method: 'file',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  return saveFile(input, user)
})


export const htmlToMarkdownResolver = authorized<
  HtmlToMarkdownSuccess,
  HtmlToMarkdownError,
  MutationHtmlToMarkdownArgs
>(async (_, { input }, { uid }) => {
  analytics.capture({
    distinctId: uid,
    event: 'html_to_markdown',
    properties: {
      url: input.url,
      method: 'page',
      source: input.source,
      env: env.server.apiEnv,
    },
  })

  const user = await userRepository.findById(uid)
  if (!user) {
    return { errorCodes: [SaveErrorCode.Unauthorized] }
  }

  const preparedDocument: PreparedDocumentInput = {
    document: input.originalContent,
    pageInfo: {
      title: input.title,
      canonicalUrl: input.url,
    },
  }

  const parseResult = await parsePreparedContent(input.url, preparedDocument)

  const markdownContent = parseResult.parsedContent ? htmlToMarkdown(parseResult.parsedContent.content) : ''

  const [_slug, croppedPathname] = createSlug(input.url, input.title)

  const title = input.title ||
    parseResult.parsedContent?.title ||
    preparedDocument?.pageInfo.title ||
    croppedPathname ||
    parseResult.parsedContent?.siteName ||
    input.url;

  return Promise.resolve({
    clientRequestId: input.clientRequestId,
    title,
    markdownContent,
    __typename: 'HtmlToMarkdownSuccess',
  }) as Promise<HtmlToMarkdownResult>
})