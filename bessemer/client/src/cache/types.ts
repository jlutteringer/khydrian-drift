import { CacheNameSchema } from '@bessemer/cornerstone/cache'
import { ResourceNamespaceSchema } from '@bessemer/cornerstone/resource'
import Zod from 'zod'
import { Entries, Globs, ZodUtil } from '@bessemer/cornerstone'

export type CacheClientContext = {}

export const CacheSummarySchema = Zod.object({ name: CacheNameSchema })
export type CacheSummary = Zod.infer<typeof CacheSummarySchema>

export const CacheDetailSchema = CacheSummarySchema.extend({ detail: Zod.string() })
export type CacheDetail = Zod.infer<typeof CacheDetailSchema>

export const CacheTargetSchema = ZodUtil.arrayable(Globs.Schema)
export type CacheTarget = Zod.infer<typeof CacheTargetSchema>

export const CacheWriteRequestSchema = Zod.object({
  caches: CacheTargetSchema,
  namespace: ResourceNamespaceSchema,
  values: ZodUtil.arrayable(Entries.recordSchema(Zod.unknown())),
})

export type CacheWriteRequest = Zod.infer<typeof CacheWriteRequestSchema>

export const CacheEvictRequestSchema = Zod.object({
  caches: CacheTargetSchema,
  sectors: ZodUtil.arrayable(Globs.Schema).optional(),
  namespace: ResourceNamespaceSchema.optional(),
  keys: ZodUtil.arrayable(ZodUtil.key()).optional(),
})

export type CacheEvictRequest = Zod.infer<typeof CacheEvictRequestSchema>
