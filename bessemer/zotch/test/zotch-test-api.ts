import Zod, { ZodType } from 'zod'
import {
  CreateRequestSchema,
  RequestDto,
  RequestSchema,
  SubmitQuoteSchema,
  TransferQuoteItemsSchema,
  UpdateRequestSchema,
  WithNoteSchema,
  WithOptionalNoteSchema,
} from './schema/test-request'
import { Zotch } from '@bessemer/zotch'

export const ContextHeadersSchema = {
  ['X-Api-Key']: Zod.string().optional(),
} as const

export const UserProfileContextHeadersSchema = {
  ...ContextHeadersSchema,
  ['Authorization']: Zod.string(),
} as const

export const AccountContextHeadersSchema = { ...ContextHeadersSchema, ['X-Account-Id']: Zod.string() } as const

export const UnauthorizedErrorSchema = {
  status: 401,
  schema: Zod.number(),
} as const

export const NotFoundErrorSchema = {
  status: 404,
  schema: Zod.unknown(),
} as const

export const RequestApi = Zotch.api({
  fetchRequestById: {
    method: 'get',
    path: 'requests/:requestId',
    response: RequestSchema as ZodType<RequestDto>,
    headers: ContextHeadersSchema,
    queries: { cache: Zod.boolean().default(true) },
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema, NotFoundErrorSchema],
  },
  fetchPublicRequestById: {
    method: 'get',
    path: 'requests/:requestId/public',
    response: RequestSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema, NotFoundErrorSchema],
  },
  fetchCart: {
    method: 'get',
    path: '/requests/cart',
    response: RequestSchema,
    headers: AccountContextHeadersSchema,
    errors: [NotFoundErrorSchema, UnauthorizedErrorSchema],
  },
  createQuote: {
    method: 'post',
    path: '/requests/quotes',
    response: RequestSchema,
    body: CreateRequestSchema,
    headers: AccountContextHeadersSchema,
    errors: [UnauthorizedErrorSchema],
  },
  updateQuote: {
    method: 'post',
    path: '/requests/quotes/:requestId',
    response: RequestSchema,
    body: UpdateRequestSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  transferQuoteItems: {
    method: 'post',
    path: '/requests/quotes/transfer-items',
    response: RequestSchema,
    body: TransferQuoteItemsSchema,
    headers: AccountContextHeadersSchema,
    errors: [UnauthorizedErrorSchema],
  },
  submitQuote: {
    method: 'post',
    path: '/requests/:requestId/submit',
    response: RequestSchema,
    body: SubmitQuoteSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  rejectQuote: {
    method: 'post',
    path: '/requests/:requestId/reject',
    response: RequestSchema,
    body: WithNoteSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  confirmQuote: {
    method: 'post',
    path: '/requests/:requestId/confirm',
    response: Zod.object({
      request: RequestSchema,
    }),
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  remindQuote: {
    method: 'post',
    path: '/requests/:requestId/remind',
    response: RequestSchema,
    body: WithOptionalNoteSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  submitAndConfirmQuote: {
    method: 'post',
    path: '/requests/:requestId/submit-confirm',
    response: Zod.object({
      request: RequestSchema,
    }),
    body: SubmitQuoteSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  cancelQuote: {
    method: 'post',
    path: '/requests/:requestId/cancel',
    response: RequestSchema,
    body: WithOptionalNoteSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  createProposalContent: {
    method: 'post',
    path: '/requests/:requestId/create-proposal',
    response: RequestSchema,
    headers: UserProfileContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
  recallQuote: {
    method: 'post',
    path: '/requests/:requestId/recall',
    response: RequestSchema,
    headers: AccountContextHeadersSchema,
    params: { requestId: Zod.string() },
    errors: [UnauthorizedErrorSchema],
  },
})
