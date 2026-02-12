import Zod, { ZodType } from 'zod'
import { Instants, Strings } from '@bessemer/cornerstone'
import { Alias } from '@bessemer/cornerstone/types'

const TextSchema = Zod.string()
  .trim()
  .transform((val) => {
    if (Strings.isEmpty(val)) {
      return null
    }
    return val
  })

export const fromText = <SchemaType extends ZodType<unknown, string | null>>(schema: SchemaType) => {
  return TextSchema.pipe(schema)
}

export const Text = fromText(Zod.string())
export const TextNullable = fromText(Zod.string().nullable()).nullable()

export const WithNoteSchema = Zod.object({
  note: Text,
})
export type WithNoteDto = Zod.output<typeof WithNoteSchema>
export type WithNoteInput = Zod.input<typeof WithNoteSchema>

export const WithOptionalNoteSchema = Zod.object({
  note: TextNullable.default(null),
})
export type WithOptionalNoteDto = Zod.output<typeof WithOptionalNoteSchema>
export type WithOptionalNoteInput = Zod.input<typeof WithOptionalNoteSchema>

export enum RequestItemStatus {
  Pending = 'pending',
  Reserved = 'reserved',
  Confirmed = 'confirmed',
  Canceled = 'canceled',
}

export const RequestItemStatusSchema = Zod.enum(RequestItemStatus)

export const RequestItemSchema = Zod.object({
  id: Zod.uuid(),
  name: Zod.string(),
  basePrice: Zod.number(),
  requestId: Zod.string(),
  status: RequestItemStatusSchema,
  createdAt: Instants.SchemaLiteral,
  submittedAt: Instants.SchemaLiteral.nullable().default(null),
  inventoryItemId: Zod.uuid(),
  eventId: Zod.uuid(),
  note: Zod.string().nullable().default(null),
  parentItemId: Zod.uuid().nullable().default(null),
})
export type RequestItemDto = Zod.infer<typeof RequestItemSchema>

export const CreateRequestItemSchema = RequestItemSchema.omit({
  id: true,
  createdAt: true,
  submittedAt: true,
  eventId: true,
  parentItemId: true,
})
export type CreateRequestItemDto = Zod.output<typeof CreateRequestItemSchema>
export type CreateRequestItemInput = Zod.input<typeof CreateRequestItemSchema>

export const UpdateRequestItemSchema = CreateRequestItemSchema.omit({ inventoryItemId: true }).partial().extend({
  toUpdate: Zod.uuid(),
})
export type UpdateRequestItemDto = Zod.output<typeof UpdateRequestItemSchema>
export type UpdateRequestItemInput = Zod.input<typeof UpdateRequestItemSchema>

export const DeleteRequestItemSchema = Zod.object({
  toDelete: Zod.string(),
})
export type DeleteRequestItemDto = Zod.infer<typeof DeleteRequestItemSchema>

export const ModifyRequestItemSchema = Zod.union([CreateRequestItemSchema, UpdateRequestItemSchema, DeleteRequestItemSchema])
export type ModifyRequestItemDto = Zod.output<typeof ModifyRequestItemSchema>
export type ModifyRequestItemInput = Zod.input<typeof ModifyRequestItemSchema>

export enum RequestStatus {
  Cart = 'cart',
  Open = 'open',
  Quote = 'quote',
  Submitted = 'submitted',
  Rejected = 'rejected',
  Confirmed = 'confirmed',
  Canceled = 'canceled',
}

export const RequestStatusSchema = Zod.enum(RequestStatus)

export const RequestSchema = Zod.object({
  id: Zod.uuid(),
  organizerId: Zod.uuid(),
  sponsorId: Zod.uuid(),
  quoteNumber: Zod.string().nullable(),
  status: RequestStatusSchema,
  name: Zod.string().nullable(),
  isProposal: Zod.boolean(),
  public: Zod.boolean(),
  items: Zod.array(RequestItemSchema),
  metadata: Zod.record(Zod.string(), Zod.any()),
  createdAt: Instants.SchemaLiteral,
  updatedAt: Instants.SchemaLiteral,
})
export type RequestDto = Alias<Zod.infer<typeof RequestSchema>>

export const CreateRequestSchema = RequestSchema.omit({ id: true, status: true, items: true, createdAt: true, updatedAt: true }).extend({
  status: Zod.union([Zod.literal(RequestStatus.Cart), Zod.literal(RequestStatus.Open), Zod.literal(RequestStatus.Quote)]).default(
    RequestStatus.Quote
  ),
  quoteNumber: RequestSchema.shape.quoteNumber.default(null),
  isProposal: RequestSchema.shape.isProposal.default(false),
  public: RequestSchema.shape.public.default(false),
  metadata: RequestSchema.shape.metadata.default({}),
  items: Zod.array(CreateRequestItemSchema).default([]),
})
export type CreateRequestDto = Zod.output<typeof CreateRequestSchema>
export type CreateRequestInput = Zod.input<typeof CreateRequestSchema>

export const UpdateRequestSchema = CreateRequestSchema.omit({ organizerId: true, sponsorId: true, items: true })
  .required()
  .partial()
  .extend({
    items: Zod.array(ModifyRequestItemSchema).default([]),
  })

export type UpdateRequestDto = Zod.output<typeof UpdateRequestSchema>
export type UpdateRequestInput = Zod.input<typeof UpdateRequestSchema>

export const TargetRequestSchema = Zod.union([Zod.string(), CreateRequestSchema])
export type TargetRequestDto = Zod.output<typeof TargetRequestSchema>
export type TargetRequestInput = Zod.input<typeof TargetRequestSchema>

export const TransferQuoteItemsSchema = Zod.object({
  sourceRequestId: Zod.string(),
  sourceRequestItemIds: Zod.array(Zod.string()),
  targetRequest: TargetRequestSchema,
})

export type TransferQuoteItemsInput = Zod.input<typeof TransferQuoteItemsSchema>
export type TransferQuoteItemsDto = Zod.output<typeof TransferQuoteItemsSchema>

export const SubmitQuoteSchema = WithOptionalNoteSchema.extend({
  preview: Zod.boolean().default(false),
  description: Zod.string().nullish(),
})
export type SubmitQuoteDto = Zod.output<typeof SubmitQuoteSchema>
export type SubmitQuoteInput = Zod.input<typeof SubmitQuoteSchema>
