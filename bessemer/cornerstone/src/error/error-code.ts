import * as ResourceKeys from '@bessemer/cornerstone/resource-key'
import { NamespacedKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorType } from '@bessemer/cornerstone/error/error-type'
import Zod from 'zod'
import { isObject } from '@bessemer/cornerstone/object'

/*
  Represents a structured error event. The code can be mapped to a unique type of error while the
  message and attributes can provide contextual information about the error. Finally,
  an ErrorEvent could have multiple causes which get aggregated into a single parent error.
 */
export type ErrorCode = NamespacedKey<ErrorType>
export const Schema = Zod.string().transform((it) => it as NamespacedKey<ErrorType>)

export type ErrorCodeBuilder = { type: ErrorType; namespace?: ResourceNamespace }
export type ErrorCodeLike = ErrorCode | ErrorCodeBuilder

export const from = (code: ErrorCodeLike): ErrorCode => {
  if (isObject(code)) {
    return ResourceKeys.namespaceKey(code.type, code.namespace ?? ResourceKeys.emptyNamespace())
  }

  return code
}

export const extendNamespace = (code: ErrorCode, additionalNamespace: ResourceNamespace): ErrorCode => {
  return ResourceKeys.extendNamespace(code, additionalNamespace)
}

export const destructure = (code: ErrorCode): [ErrorType, ResourceNamespace] => {
  return ResourceKeys.destructureKey(code)
}

export const getErrorType = (code: ErrorCode): ErrorType => {
  return ResourceKeys.getKey(code)
}

export const getNamespace = (code: ErrorCode): ResourceNamespace => {
  return ResourceKeys.getNamespace(code)
}
