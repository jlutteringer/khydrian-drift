import { ErrorCodes, ResourceKeys } from '@bessemer/cornerstone'
import { ErrorType } from '@bessemer/cornerstone/error/error-type'
import { ErrorCode } from '@bessemer/cornerstone/error/error-code'

describe('ErrorCodes.from', () => {
  test('should return error code string as-is when passed a string', () => {
    const errorCode = 'simple-error-code' as ErrorCode
    const result = ErrorCodes.from(errorCode)
    expect(result).toBe(errorCode)
  })

  test('should convert object with type and namespace to namespaced key', () => {
    const errorCodeLike = {
      type: 'validation-error' as ErrorType,
      namespace: ResourceKeys.createNamespace('user/profile'),
    }
    const result = ErrorCodes.from(errorCodeLike)
    expect(result).toBe('user/profile/validation-error')
  })

  test('should handle object with type and no namespace', () => {
    const errorCodeLike = {
      type: 'not-found' as ErrorType,
    }
    const result = ErrorCodes.from(errorCodeLike)
    expect(result).toBe('not-found')
  })

  test('should handle object with type and empty namespace', () => {
    const errorCodeLike = {
      type: 'server-error' as ErrorType,
      namespace: ResourceKeys.emptyNamespace(),
    }
    const result = ErrorCodes.from(errorCodeLike)
    expect(result).toBe('server-error')
  })
})

describe('ErrorCodes.extendNamespace', () => {
  test('should extend existing namespaced error code', () => {
    const baseCode = 'user/profile/validation-error' as ErrorCode
    const additionalNamespace = ResourceKeys.createNamespace('form')
    const result = ErrorCodes.extendNamespace(baseCode, additionalNamespace)
    expect(result).toBe('form/user/profile/validation-error')
  })

  test('should extend simple error code with namespace', () => {
    const baseCode = 'timeout-error' as ErrorCode
    const additionalNamespace = ResourceKeys.createNamespace('network')
    const result = ErrorCodes.extendNamespace(baseCode, additionalNamespace)
    expect(result).toBe('network/timeout-error')
  })

  test('should extend with multi-level additional namespace', () => {
    const baseCode = 'validation/required-field' as ErrorCode
    const additionalNamespace = ResourceKeys.createNamespace('api/v2')
    const result = ErrorCodes.extendNamespace(baseCode, additionalNamespace)
    expect(result).toBe('api/v2/validation/required-field')
  })

  test('should handle extending with empty additional namespace', () => {
    const baseCode = 'auth/invalid-token' as ErrorCode
    const additionalNamespace = ResourceKeys.emptyNamespace()
    const result = ErrorCodes.extendNamespace(baseCode, additionalNamespace)
    expect(result).toBe('auth/invalid-token')
  })

  test('should handle extending code with encoded characters', () => {
    const baseCode = 'user%2Fprofile/error' as ErrorCode
    const additionalNamespace = ResourceKeys.createNamespace('special')
    const result = ErrorCodes.extendNamespace(baseCode, additionalNamespace)
    expect(result).toBe('special/user%2Fprofile/error')
  })

  test('should chain multiple namespace extensions', () => {
    const baseCode = 'database-error' as ErrorCode
    const firstExtension = ResourceKeys.createNamespace('service')
    const secondExtension = ResourceKeys.createNamespace('critical')
    const firstResult = ErrorCodes.extendNamespace(baseCode, firstExtension)
    const finalResult = ErrorCodes.extendNamespace(firstResult, secondExtension)
    expect(finalResult).toBe('critical/service/database-error')
  })
})
