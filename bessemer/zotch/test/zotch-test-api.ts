import Zod from 'zod'
import {
  CreateRequestSchema,
  RequestSchema,
  SubmitQuoteSchema,
  TransferQuoteItemsSchema,
  UpdateRequestSchema,
  WithNoteSchema,
  WithOptionalNoteSchema,
} from './zod-test-schema'
import { Zotch } from '@bessemer/zotch'

export const ContextHeadersSchema = [
  {
    name: 'X-Api-Key',
    schema: Zod.string().optional(),
  },
  {
    name: 'Content-Type',
    schema: Zod.literal('application/json').default('application/json'),
  },
] as const

export const UserProfileContextHeadersSchema = [
  ...ContextHeadersSchema,
  {
    name: 'Authorization',
    schema: Zod.string(),
  },
] as const

export const AccountContextHeadersSchema = [
  ...ContextHeadersSchema,
  {
    name: 'X-Account-Id',
    schema: Zod.uuid(),
  },
] as const

export const UnauthorizedErrorSchema = {
  status: 401,
  schema: Zod.number(),
} as const

export const NotFoundErrorSchema = {
  status: 404,
  schema: Zod.unknown(),
} as const

export const RequestApi = Zotch.makeApi([
  {
    alias: 'fetchRequestById',
    method: 'get',
    path: 'requests/:requestId',
    response: RequestSchema,
    headers: [...ContextHeadersSchema],
    queries: [
      {
        name: 'cache',
        schema: Zod.boolean().default(true),
      },
    ],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema, NotFoundErrorSchema],
  },
  {
    alias: 'fetchCart',
    method: 'get',
    path: '/requests/cart',
    response: RequestSchema,
    headers: [...AccountContextHeadersSchema],
    errors: [NotFoundErrorSchema, UnauthorizedErrorSchema],
  },
  {
    alias: 'createQuote',
    method: 'post',
    path: '/requests/quotes',
    response: RequestSchema,
    body: {
      name: 'CreateQuoteDto',
      schema: CreateRequestSchema,
    },
    headers: [...AccountContextHeadersSchema],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'updateQuote',
    method: 'post',
    path: '/requests/quotes/:requestId',
    response: RequestSchema,
    body: {
      name: 'UpdateQuoteDto',
      schema: UpdateRequestSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'transferQuoteItems',
    method: 'post',
    path: '/requests/quotes/transfer-items',
    response: RequestSchema,
    body: {
      name: 'TransferQuoteItemsDto',
      schema: TransferQuoteItemsSchema,
    },
    headers: [...AccountContextHeadersSchema],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'submitQuote',
    method: 'post',
    path: '/requests/:requestId/submit',
    response: RequestSchema,
    body: {
      name: 'SubmitQuoteDto',
      schema: SubmitQuoteSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'rejectQuote',
    method: 'post',
    path: '/requests/:requestId/reject',
    response: RequestSchema,
    body: {
      name: 'WithNoteDto',
      schema: WithNoteSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'confirmQuote',
    method: 'post',
    path: '/requests/:requestId/confirm',
    response: Zod.object({
      request: RequestSchema,
    }),
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'remindQuote',
    method: 'post',
    path: '/requests/:requestId/remind',
    response: RequestSchema,
    body: {
      name: 'WithNoteDto',
      schema: WithOptionalNoteSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'submitAndConfirmQuote',
    method: 'post',
    path: '/requests/:requestId/submit-confirm',
    response: Zod.object({
      request: RequestSchema,
    }),
    body: {
      name: 'SubmitQuoteDto',
      schema: SubmitQuoteSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'cancelQuote',
    method: 'post',
    path: '/requests/:requestId/cancel',
    response: RequestSchema,
    body: {
      name: 'WithNoteDto',
      schema: WithOptionalNoteSchema,
    },
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'createProposalContent',
    method: 'post',
    path: '/requests/:requestId/create-proposal',
    response: RequestSchema,
    headers: [...UserProfileContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'recallQuote',
    method: 'post',
    path: '/requests/:requestId/recall',
    response: RequestSchema,
    headers: [...AccountContextHeadersSchema],
    parameters: [
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
])
