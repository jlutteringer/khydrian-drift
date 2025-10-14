import { ErrorCauses, ErrorTypes, ResourceKeys } from '@bessemer/cornerstone'
import { HttpStatusCodeAttribute, ValueAttribute } from '@bessemer/cornerstone/error/error-cause'
import { ErrorCode } from '@bessemer/cornerstone/error/error-code'

describe('ErrorCauses.from', () => {
  test('should create error cause with minimal builder', () => {
    const builder = {
      code: { type: ErrorTypes.InvalidValue },
      message: 'Test message',
    }

    const result = ErrorCauses.from(builder)

    expect(result.code).toBe(ErrorTypes.InvalidValue)
    expect(result.message).toBe('Test message')
    expect(result.attributes).toEqual({})
    expect(result.causes).toEqual([])
  })

  test('should create error cause with code object', () => {
    const builder = {
      code: { type: ErrorTypes.InvalidValue, namespace: ResourceKeys.createNamespace('api') },
      message: 'Validation failed',
    }

    const result = ErrorCauses.from(builder)

    expect(result.code).toBe('api/invalid-value')
    expect(result.message).toBe('Validation failed')
    expect(result.attributes).toEqual({})
    expect(result.causes).toEqual([])
  })

  test('should create error cause with attributes', () => {
    const builder = {
      code: { type: ErrorTypes.InvalidValue },
      message: 'Field is invalid',
      attributes: { field: 'email', value: 'invalid-email' },
    }

    const result = ErrorCauses.from(builder)

    expect(result.code).toBe(ErrorTypes.InvalidValue)
    expect(result.message).toBe('Field is invalid')
    expect(result.attributes).toEqual({ field: 'email', value: 'invalid-email' })
    expect(result.causes).toEqual([])
  })

  test('should create error cause with nested causes', () => {
    const builder = {
      code: 'parent-error' as ErrorCode,
      message: 'Parent error occurred',
      causes: [
        {
          code: 'child-error-1' as ErrorCode,
          message: 'First child error',
        },
        {
          code: 'child-error-2' as ErrorCode,
          message: 'Second child error',
          attributes: { detail: 'specific issue' },
        },
      ],
    }

    const result = ErrorCauses.from(builder)

    expect(result.code).toBe('parent-error')
    expect(result.message).toBe('Parent error occurred')
    expect(result.causes).toHaveLength(2)
    expect(result.causes[0]!.code).toBe('child-error-1')
    expect(result.causes[0]!.message).toBe('First child error')
    expect(result.causes[1]!.code).toBe('child-error-2')
    expect(result.causes[1]!.message).toBe('Second child error')
    expect(result.causes[1]!.attributes).toEqual({ detail: 'specific issue' })
  })
})

describe('ErrorCauses.unhandled', () => {
  test('should create unhandled error with defaults', () => {
    const result = ErrorCauses.unhandled()

    expect(result.code).toMatch(/unhandled$/)
    expect(result.message).toBe('An Unhandled Error has occurred.')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(500)
    expect(result.causes).toEqual([])
  })

  test('should create unhandled error with overrides', () => {
    const result = ErrorCauses.unhandled({
      namespace: ResourceKeys.createNamespace('api/v1'),
      message: 'System failure detected',
      attributes: { correlationId: '123', service: 'payment' },
      causes: [{ code: 'database-connection-failed' as ErrorCode, message: 'Cannot connect to database' }],
    })

    expect(result.code).toBe('api/v1/unhandled')
    expect(result.message).toBe('System failure detected')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(500)
    expect(result.attributes.correlationId).toBe('123')
    expect(result.attributes.service).toBe('payment')
    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('database-connection-failed')
    expect(result.causes[0]!.message).toBe('Cannot connect to database')
  })
})

describe('ErrorCauses.unauthorized', () => {
  test('should create unauthorized error with defaults', () => {
    const result = ErrorCauses.unauthorized()

    expect(result.code).toMatch(/unauthorized$/)
    expect(result.message).toBe('The requested Resource requires authentication.')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(401)
    expect(result.causes).toEqual([])
  })

  test('should create unauthorized error with overrides', () => {
    const result = ErrorCauses.unauthorized({
      namespace: ResourceKeys.createNamespace('auth'),
      message: 'Invalid authentication token provided',
      attributes: { tokenType: 'Bearer' },
      causes: [{ code: 'token-expired' as ErrorCode, message: 'Authentication token has expired' }],
    })

    expect(result.code).toBe('auth/unauthorized')
    expect(result.message).toBe('Invalid authentication token provided')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(401)
    expect(result.attributes.tokenType).toBe('Bearer')
    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('token-expired')
  })
})

describe('ErrorCauses.forbidden', () => {
  test('should create forbidden error with defaults', () => {
    const result = ErrorCauses.forbidden()

    expect(result.code).toMatch(/forbidden$/)
    expect(result.message).toBe('The requested Resource requires additional permissions to access.')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(403)
    expect(result.causes).toEqual([])
  })

  test('should create forbidden error with overrides', () => {
    const result = ErrorCauses.forbidden({
      namespace: ResourceKeys.createNamespace('admin'),
      message: 'Admin access required',
      attributes: { requiredRole: 'ADMIN', userRole: 'USER' },
      causes: [{ code: 'insufficient-permissions' as ErrorCode, message: 'User lacks required permissions' }],
    })

    expect(result.code).toBe('admin/forbidden')
    expect(result.message).toBe('Admin access required')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(403)
    expect(result.attributes.requiredRole).toBe('ADMIN')
    expect(result.attributes.userRole).toBe('USER')
    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('insufficient-permissions')
  })
})

describe('ErrorCauses.invalidValue', () => {
  test('should create invalid value error with defaults', () => {
    const result = ErrorCauses.invalidValue('invalid-email@bessemer.com')

    expect(result.code).toMatch(/invalid-value$/)
    expect(result.message).toBe('The format is invalid and cannot be processed.')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(400)
    expect(result.attributes[ValueAttribute]).toBe('invalid-email@bessemer.com')
    expect(result.causes).toEqual([])
  })

  test('should create invalid value error with overrides', () => {
    const result = ErrorCauses.invalidValue(
      { score: 150 },
      {
        namespace: ResourceKeys.createNamespace('game/validation'),
        message: 'Score exceeds maximum allowed value',
        attributes: { maxValue: 100, field: 'score' },
        causes: [{ code: 'range-exceeded' as ErrorCode, message: 'Value is outside valid range' }],
      }
    )

    expect(result.code).toBe('game/validation/invalid-value')
    expect(result.message).toBe('Score exceeds maximum allowed value')
    expect(result.attributes[HttpStatusCodeAttribute]).toBe(400)
    expect(result.attributes[ValueAttribute]).toEqual({ score: 150 })
    expect(result.attributes.maxValue).toBe(100)
    expect(result.attributes.field).toBe('score')
    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('range-exceeded')
  })
})
