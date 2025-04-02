import { CacheNameSchema } from '@bessemer/cornerstone/cache'
import { ResourceNamespaceSchema } from '@bessemer/cornerstone/resource'
import { Zod } from '@bessemer/cornerstone'
import { GlobPatternSchema } from '@bessemer/cornerstone/glob'

export type CacheClientContext = {}

export const CacheSummarySchema = Zod.object({ name: CacheNameSchema })
export type CacheSummary = Zod.infer<typeof CacheSummarySchema>

export const CacheDetailSchema = CacheSummarySchema.extend({ detail: Zod.string() })
export type CacheDetail = Zod.infer<typeof CacheDetailSchema>

export const CacheTargetSchema = Zod.arrayable(GlobPatternSchema)
export type CacheTarget = Zod.infer<typeof CacheTargetSchema>

export const CacheWriteRequestSchema = Zod.object({
  caches: CacheTargetSchema,
  namespace: ResourceNamespaceSchema,
  values: Zod.arrayable(Zod.entry(Zod.unknown())),
})

export type CacheWriteRequest = Zod.infer<typeof CacheWriteRequestSchema>

export const CacheEvictRequestSchema = Zod.object({
  caches: CacheTargetSchema,
  sectors: Zod.arrayable(GlobPatternSchema).optional(),
  namespace: ResourceNamespaceSchema.optional(),
  keys: Zod.arrayable(Zod.key()).optional(),
})

export type CacheEvictRequest = Zod.infer<typeof CacheEvictRequestSchema>
