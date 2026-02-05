export type FetchRequest = NonNullable<Parameters<typeof fetch>[1]>
export type FetchResponse = Awaited<ReturnType<typeof fetch>>
export type FetchPayload = { url: string } & FetchRequest
export type FetchFunction = (url: string, request: FetchRequest | undefined) => Promise<FetchResponse>
