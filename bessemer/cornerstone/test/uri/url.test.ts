import { Urls } from '@bessemer/cornerstone'

describe('Urls.fromString', () => {
  test('should parse HTTPS URL with host only', () => {
    expect(Urls.fromString('https://www.google.com')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  })

  test('should parse HTTPS URL with host and trailing slash', () => {
    expect(Urls.fromString('https://www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  })

  test('should parse protocol-relative URL with host only', () => {
    expect(Urls.fromString('//www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse protocol-relative URL with host and trailing slash', () => {
    expect(Urls.fromString('//www.google.com/')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse HTTP URL with localhost and port', () => {
    expect(Urls.fromString('http://localhost:8080')).toEqual(
      Urls.from({
        scheme: 'http',
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  })

  test('should parse HTTP URL with localhost, port and trailing slash', () => {
    expect(Urls.fromString('http://localhost:8080/')).toEqual(
      Urls.from({
        scheme: 'http',
        host: 'localhost:8080',
      })
    )
  })

  test('should parse protocol-relative URL with localhost and port', () => {
    expect(Urls.fromString('//localhost:8080')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  })

  test('should parse protocol-relative URL with localhost, port and trailing slash', () => {
    expect(Urls.fromString('//localhost:8080/')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  })

  test('should parse HTTPS URL with authentication object', () => {
    expect(Urls.fromString('https://john.lutteringer:password123@www.google.com')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
          password: 'password123',
        },
      })
    )
  })

  test('should parse HTTPS URL with authentication string', () => {
    expect(Urls.fromString('https://john.lutteringer:password123@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer:password123',
      })
    )
  })

  test('should parse HTTPS URL with authentication principal only', () => {
    expect(Urls.fromString('https://john.lutteringer@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer',
      })
    )
  })

  test('should parse URL with authentication without scheme', () => {
    expect(Urls.fromString('john.lutteringer@www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
        },
      })
    )
  })

  test('should parse protocol-relative URL with authentication', () => {
    expect(Urls.fromString('//john.lutteringer:password123@www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
          password: 'password123',
        },
      })
    )
  })

  test('should parse protocol-relative URL with query parameters', () => {
    expect(Urls.fromString('//www.google.com?q=Search%20Query')).toEqual(
      Urls.from({
        host: 'www.google.com',
        location: {
          parameters: {
            q: 'Search Query',
          },
        },
      })
    )
  })

  test('should parse path-only URL with query parameters', () => {
    expect(Urls.fromString('/search?q=Search%20Query')).toEqual(
      Urls.from({
        location: {
          path: '/search',
          parameters: {
            q: 'Search Query',
          },
        },
      })
    )
  })

  test('should parse relative path with query parameters', () => {
    expect(Urls.fromString('search?q=Search%20Query')).toEqual(
      Urls.from({
        location: {
          path: 'search',
          parameters: {
            q: 'Search Query',
          },
        },
      })
    )
  })
})
