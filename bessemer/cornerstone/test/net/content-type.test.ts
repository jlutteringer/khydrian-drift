import { ContentTypes, MimeTypes } from '@bessemer/cornerstone'

describe('ContentTypes.from', () => {
  test('should parse simple MIME type', () => {
    const result = ContentTypes.from('application/json')
    expect(result).toEqual({
      mimeType: 'application/json',
      parameters: {},
    })
  })

  test('should parse MIME type with single parameter', () => {
    const result = ContentTypes.from('text/html; charset=utf-8')
    expect(result).toEqual({
      mimeType: 'text/html',
      parameters: { charset: 'utf-8' },
    })
  })

  test('should parse MIME type with multiple parameters', () => {
    const result = ContentTypes.from('multipart/form-data; boundary=abc123; type=message')
    expect(result).toEqual({
      mimeType: 'multipart/form-data',
      parameters: { boundary: 'abc123', type: 'message' },
    })
  })

  test('should parse quoted parameter values', () => {
    const result = ContentTypes.from('multipart/form-data; boundary="my boundary string"')
    expect(result).toEqual({
      mimeType: 'multipart/form-data',
      parameters: { boundary: 'my boundary string' },
    })
  })

  test('should parse quoted parameter with escaped quotes', () => {
    const result = ContentTypes.from('multipart/form-data; boundary="this \\"value\\" is cool"')
    expect(result).toEqual({
      mimeType: 'multipart/form-data',
      parameters: { boundary: 'this "value" is cool' },
    })
  })

  test('should normalize whitespace around parameters', () => {
    const result = ContentTypes.from('text/html ; charset = utf-8 ; type = test')
    expect(result).toEqual({
      mimeType: 'text/html',
      parameters: { charset: 'utf-8', type: 'test' },
    })
  })

  test('should handle empty quoted string', () => {
    const result = ContentTypes.from('text/html; boundary=""')
    expect(result).toEqual({
      mimeType: 'text/html',
      parameters: { boundary: '' },
    })
  })

  test('should throw for invalid MIME type', () => {
    expect(() => ContentTypes.from('not-a-valid-mime')).toThrow()
  })

  test('should throw for parameter without equals sign', () => {
    expect(() => ContentTypes.from('text/html; charset')).toThrow()
  })

  test('should throw for duplicate parameter keys', () => {
    expect(() => ContentTypes.from('text/html; charset=utf-8; charset=iso-8859-1')).toThrow()
  })

  test('should throw for unquoted value with quotes', () => {
    expect(() => ContentTypes.from('text/html; boundary=this "value" is cool')).toThrow()
  })

  test('should throw for quoted value with unescaped internal quotes', () => {
    expect(() => ContentTypes.from('text/html; boundary="this "value" is cool"')).toThrow()
  })

  test('should throw for quoted value without closing quote', () => {
    expect(() => ContentTypes.from('text/html; boundary="unclosed')).toThrow()
  })

  test('should throw for invalid parameter key characters', () => {
    expect(() => ContentTypes.from('text/html; key"bla=value')).toThrow()
  })

  test('should throw for empty parameter value', () => {
    expect(() => ContentTypes.from('text/html; charset=')).toThrow()
  })
})

describe('ContentTypes.toLiteral', () => {
  test('should convert simple MIME type to literal', () => {
    const contentType = { mimeType: MimeTypes.Json, parameters: {} }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe(MimeTypes.Json)
  })

  test('should convert MIME type with parameters to literal', () => {
    const contentType = { mimeType: MimeTypes.Html, parameters: { charset: 'utf-8' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('text/html;charset=utf-8')
  })

  test('should convert MIME type with multiple parameters to literal', () => {
    const contentType = { mimeType: MimeTypes.FormData, parameters: { boundary: 'abc123', type: 'message' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('multipart/form-data;boundary=abc123;type=message')
  })

  test('should quote parameter values with special characters', () => {
    const contentType = { mimeType: MimeTypes.FormData, parameters: { boundary: 'my boundary string' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('multipart/form-data;boundary="my boundary string"')
  })

  test('should quote values with semicolons', () => {
    const contentType = { mimeType: MimeTypes.Text, parameters: { note: 'value;with;semicolons' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('text/plain;note="value;with;semicolons"')
  })

  test('should quote values with equals signs', () => {
    const contentType = { mimeType: MimeTypes.Text, parameters: { formula: 'a=b+c' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('text/plain;formula="a=b+c"')
  })

  test('should handle blanks', () => {
    const contentType = { mimeType: MimeTypes.Text, parameters: { blank: '' } }
    const result = ContentTypes.toLiteral(contentType)
    expect(result).toBe('text/plain;blank=""')
  })
})

describe('ContentTypes round-trip', () => {
  test('should maintain value through from->toLiteral round-trip', () => {
    const original = 'application/json'
    const parsed = ContentTypes.from(original)
    const literal = ContentTypes.toLiteral(parsed)
    expect(literal).toBe(original)
  })

  test('should normalize and maintain value through round-trip', () => {
    const original = 'text/html ; charset = utf-8'
    const parsed = ContentTypes.from(original)
    const literal = ContentTypes.toLiteral(parsed)
    expect(literal).toBe('text/html;charset=utf-8')
  })

  test('should handle quoted values in round-trip', () => {
    const original = 'multipart/form-data; boundary="my boundary"'
    const parsed = ContentTypes.from(original)
    const literal = ContentTypes.toLiteral(parsed)
    expect(literal).toBe('multipart/form-data;boundary="my boundary"')
  })

  test('should preserve escaped quotes in round-trip', () => {
    const original = 'multipart/form-data; boundary="this \\"value\\" is cool"'
    const parsed = ContentTypes.from(original)
    expect(parsed.parameters.boundary).toBe('this "value" is cool')
    const literal = ContentTypes.toLiteral(parsed)
    expect(literal).toBe('multipart/form-data;boundary="this "value" is cool"')
  })

  test('should handle multiple parameters in round-trip', () => {
    const original = 'text/html; charset=utf-8; boundary=abc123'
    const parsed = ContentTypes.from(original)
    const literal = ContentTypes.toLiteral(parsed)
    expect(literal).toBe('text/html;charset=utf-8;boundary=abc123')
  })
})
