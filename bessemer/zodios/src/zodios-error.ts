import { ReadonlyDeep } from '@bessemer/zodios/utils.types'
import { AnyZodiosRequestOptions } from '@bessemer/zodios/types'
import { AxiosError } from 'axios'

export class ZodiosFetchError extends Error {
  constructor(public override readonly cause: Error) {
    super()
  }
}

export class ZodiosValidationError extends Error {
  constructor(
    message: string,
    public readonly config?: ReadonlyDeep<AnyZodiosRequestOptions>,
    public readonly data?: unknown,
    public override readonly cause?: Error
  ) {
    super(message)
  }
}

export class ZodiosStructuredError extends Error {}

export type ZodiosError = ZodiosStructuredError | ZodiosValidationError | AxiosError
