import { ErrorEvents, ErrorTypes, ResourceKeys } from '@bessemer/cornerstone'

describe('ErrorEvents.from', () => {
  test('should create error event with single code', () => {
    const result = ErrorEvents.from({
      code: { type: ErrorTypes.InvalidValue },
      message: 'Validation failed',
    })

    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('invalid-value')
    expect(result.causes[0]!.message).toBe('Validation failed')
    expect(result.message).toBe('Validation failed')
    expect(result.context).toEqual({})
  })

  test('should create error event with code and overrides', () => {
    const result = ErrorEvents.from({
      code: { type: ErrorTypes.InvalidValue, namespace: ResourceKeys.createNamespace('api/v1') },
      message: 'Invalid request format',
      attributes: { field: 'email', value: 'bad-email' },
      context: { requestId: '123', userId: 'user-456' },
    })

    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('api/v1/invalid-value')
    expect(result.causes[0]!.message).toBe('Invalid request format')
    expect(result.causes[0]!.attributes).toEqual({ field: 'email', value: 'bad-email' })
    expect(result.message).toBe('Invalid request format')
    expect(result.context).toEqual({ requestId: '123', userId: 'user-456' })
  })

  test('should create error event with multiple causes', () => {
    const result = ErrorEvents.from({
      causes: [
        { code: { type: ErrorTypes.Required }, message: 'Name is required' },
        { code: { type: ErrorTypes.InvalidValue }, message: 'Email format is invalid', attributes: { field: 'email' } },
      ],
      message: 'Validation errors occurred',
    })

    expect(result.causes).toHaveLength(2)
    expect(result.causes[0]!.code).toBe(ErrorTypes.Required)
    expect(result.causes[0]!.message).toBe('Name is required')
    expect(result.causes[1]!.code).toBe(ErrorTypes.InvalidValue)
    expect(result.causes[1]!.message).toBe('Email format is invalid')
    expect(result.causes[1]!.attributes).toEqual({ field: 'email' })
    expect(result.message).toBe('Validation errors occurred')
    expect(result.context).toEqual({})
  })

  test('should create error event with causes and context', () => {
    const result = ErrorEvents.from({
      causes: [
        {
          code: { type: ErrorTypes.InvalidValue, namespace: ResourceKeys.createNamespace('user') },
          message: 'Invalid user data',
          attributes: { userId: 123 },
        },
      ],
      message: 'User operation failed',
      context: { operation: 'create', timestamp: '2024-01-01T00:00:00Z' },
    })

    expect(result.causes).toHaveLength(1)
    expect(result.causes[0]!.code).toBe('user/invalid-value')
    expect(result.causes[0]!.message).toBe('Invalid user data')
    expect(result.causes[0]!.attributes).toEqual({ userId: 123 })
    expect(result.message).toBe('User operation failed')
    expect(result.context).toEqual({ operation: 'create', timestamp: '2024-01-01T00:00:00Z' })
  })

  test('should throw assertion error when causes is empty array', () => {
    expect(() => {
      ErrorEvents.from({
        causes: [],
        message: 'Error with empty causes',
      })
    }).toThrow()
  })
})
