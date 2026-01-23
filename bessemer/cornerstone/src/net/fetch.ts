export type FetchOptions = NonNullable<Parameters<typeof fetch>[1]>
export type FetchResponse = Awaited<ReturnType<typeof fetch>>
