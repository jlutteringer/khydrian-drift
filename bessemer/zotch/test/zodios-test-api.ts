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
    type: 'Header',
    schema: Zod.string().optional(),
  },
  {
    name: 'Content-Type',
    type: 'Header',
    schema: Zod.literal('application/json').default('application/json'),
  },
] as const

export const UserProfileContextHeadersSchema = [
  ...ContextHeadersSchema,
  {
    name: 'Authorization',
    type: 'Header',
    schema: Zod.string(),
  },
] as const

export const AccountContextHeadersSchema = [
  ...ContextHeadersSchema,
  {
    name: 'X-Account-Id',
    type: 'Header',
    schema: Zod.uuid(),
  },
] as const

export const UnauthorizedErrorSchema = {
  status: 401,
  schema: Zod.number(),
} as const

export const NotFoundErrorSchema = {
  status: 404,
  schema: Zod.string(),
} as const

export const RequestApi = Zotch.makeApi([
  {
    alias: 'fetchRequestById',
    method: 'get',
    path: '/requests/:requestId',
    response: RequestSchema,
    parameters: [
      ...ContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'cache',
        type: 'Query',
        schema: Zod.boolean().default(true),
      },
    ],
    errors: [UnauthorizedErrorSchema, NotFoundErrorSchema],
  },
  {
    alias: 'fetchCart',
    method: 'get',
    path: '/requests/cart',
    response: RequestSchema,
    parameters: [...AccountContextHeadersSchema],
    errors: [NotFoundErrorSchema, UnauthorizedErrorSchema],
  },
  {
    alias: 'createQuote',
    method: 'post',
    path: '/requests/quotes',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'CreateQuoteDto',
        type: 'Body',
        schema: CreateRequestSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'updateQuote',
    method: 'post',
    path: '/requests/quotes/:requestId',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'UpdateQuoteDto',
        type: 'Body',
        schema: UpdateRequestSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'transferQuoteItems',
    method: 'post',
    path: '/requests/quotes/transfer-items',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'TransferQuoteItemsDto',
        type: 'Body',
        schema: TransferQuoteItemsSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'submitQuote',
    method: 'post',
    path: '/requests/:requestId/submit',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'SubmitQuoteDto',
        type: 'Body',
        schema: SubmitQuoteSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'rejectQuote',
    method: 'post',
    path: '/requests/:requestId/reject',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'WithNoteDto',
        type: 'Body',
        schema: WithNoteSchema,
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
    parameters: [
      ...AccountContextHeadersSchema,
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
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'WithNoteDto',
        type: 'Body',
        schema: WithOptionalNoteSchema,
      },
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
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'SubmitQuoteDto',
        type: 'Body',
        schema: SubmitQuoteSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'cancelQuote',
    method: 'post',
    path: '/requests/:requestId/cancel',
    response: RequestSchema,
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
      {
        name: 'WithNoteDto',
        type: 'Body',
        schema: WithOptionalNoteSchema,
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
  {
    alias: 'createProposalContent',
    method: 'post',
    path: '/requests/:requestId/create-proposal',
    response: RequestSchema,
    parameters: [
      ...UserProfileContextHeadersSchema,
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
    parameters: [
      ...AccountContextHeadersSchema,
      {
        name: 'requestId',
        type: 'Path',
        schema: Zod.string(),
      },
    ],
    errors: [UnauthorizedErrorSchema],
  },
])
