import { Urls } from '@bessemer/cornerstone'

describe('Urls.from', () => {
  test('should build URL with scheme and host object', () => {
    const result = Urls.from({
      scheme: 'https',
      host: {
        value: 'example.com',
        port: 8080,
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBe(8080)
    expect(result.location.path).toBe(null)
    expect(result.location.pathSegments).toEqual([])
    expect(result.location.relative).toBe(false)
  })

  test('should build URL with scheme and host string', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'example.com:9000',
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBe(9000)
  })

  test('should build URL with authentication object', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      authentication: {
        principal: 'user123',
        password: 'secret456',
      },
    })

    expect(result.authentication?.principal).toBe('user123')
    expect(result.authentication?.password).toBe('secret456')
  })

  test('should build URL with authentication string', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      authentication: 'admin:password',
    })

    expect(result.authentication?.principal).toBe('admin')
    expect(result.authentication?.password).toBe('password')
  })

  test('should build URL with authentication principal only', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'server.com',
      authentication: {
        principal: 'root',
      },
    })

    expect(result.authentication?.principal).toBe('root')
    expect(result.authentication?.password).toBeNull()
  })

  test('should build URL with absolute path segments', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        pathSegments: ['v1', 'users', '123'],
      },
    })

    expect(result.location.pathSegments).toEqual(['v1', 'users', '123'])
    expect(result.location.path).toBe('/v1/users/123')
    expect(result.location.relative).toBe(false)
  })

  test('should build URL with relative path segments', () => {
    const result = Urls.from({
      location: {
        pathSegments: ['docs', 'guide'],
        relative: true,
      },
    })

    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.path).toBe('docs/guide')
    expect(result.location.relative).toBe(true)
  })

  test('should build URL with path string', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'docs.example.com',
      location: {
        path: '/guide/getting-started',
      },
    })

    expect(result.location.path).toBe('/guide/getting-started')
    expect(result.location.pathSegments).toEqual(['guide', 'getting-started'])
    expect(result.location.relative).toBe(false)
  })

  test('should build URL with query parameters object', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'search.example.com',
      location: {
        parameters: {
          q: 'typescript',
          page: '2',
          limit: '50',
        },
      },
    })

    expect(result.location.parameters).toEqual({
      q: 'typescript',
      page: '2',
      limit: '50',
    })

    expect(result.location.query).toBe('q=typescript&page=2&limit=50')
  })

  test('should build URL with array query parameters', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        parameters: {
          tags: ['javascript', 'typescript', 'react'],
          format: 'json',
        },
      },
    })

    expect(result.location.parameters).toEqual({
      tags: ['javascript', 'typescript', 'react'],
      format: 'json',
    })

    expect(result.location.query).toBe('tags=javascript&tags=typescript&tags=react&format=json')
  })

  test('should build URL with query string', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        query: 'format=json&year=2024',
      },
    })

    expect(result.location.query).toBe('format=json&year=2024')
    expect(result.location.parameters).toEqual({
      format: 'json',
      year: '2024',
    })
  })

  test('should build URL with fragment', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'docs.example.com',
      location: {
        path: '/api/reference',
        fragment: 'authentication',
      },
    })

    expect(result.location.fragment).toBe('authentication')
  })

  test('should build complex URL with all components as objects', () => {
    const result = Urls.from({
      scheme: 'https',
      authentication: {
        principal: 'api_user',
        password: 'token123',
      },
      host: {
        value: 'secure.api.com',
        port: 443,
      },
      location: {
        pathSegments: ['v2', 'data', 'reports'],
        parameters: {
          format: 'json',
          year: '2024',
        },
        fragment: 'summary',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.authentication?.principal).toBe('api_user')
    expect(result.authentication?.password).toBe('token123')
    expect(result.host?.value).toBe('secure.api.com')
    expect(result.host?.port).toBe(443)
    expect(result.location.pathSegments).toEqual(['v2', 'data', 'reports'])
    expect(result.location.path).toBe('/v2/data/reports')
    expect(result.location.parameters).toEqual({
      format: 'json',
      year: '2024',
    })
    expect(result.location.query).toBe('format=json&year=2024')
    expect(result.location.fragment).toBe('summary')
  })

  test('should build relative URL with path segments only', () => {
    const result = Urls.from({
      location: {
        pathSegments: ['assets', 'images', 'logo.png'],
        relative: true,
      },
    })

    expect(result.scheme).toBeNull()
    expect(result.host).toBeNull()
    expect(result.authentication).toBeNull()
    expect(result.location.pathSegments).toEqual(['assets', 'images', 'logo.png'])
    expect(result.location.path).toBe('assets/images/logo.png')
    expect(result.location.relative).toBe(true)
  })

  test('should build URL with IPv6 host', () => {
    const result = Urls.from({
      scheme: 'http',
      host: {
        value: '[2001:db8::1]',
        port: 8080,
      },
      location: {
        pathSegments: ['api', 'v1'],
      },
    })

    expect(result.host?.value).toBe('[2001:db8::1]')
    expect(result.host?.port).toBe(8080)
    expect(result.location.pathSegments).toEqual(['api', 'v1'])
  })

  test('should build URL with encoded path segments', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['user data', 'file name.txt'],
      },
    })

    expect(result.location.pathSegments).toEqual(['user data', 'file name.txt'])
    expect(result.location.path).toBe('/user%20data/file%20name.txt')
  })

  test('should build URL with empty path segments', () => {
    const result = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: [],
      },
    })

    expect(result.location.pathSegments).toEqual([])
    expect(result.location.path).toBe(null)
    expect(result.location.relative).toBe(false)
  })

  test('should return existing URL instance unchanged', () => {
    const originalUrl = Urls.fromString('https://example.com/path')
    const result = Urls.from(originalUrl)
    expect(result).toBe(originalUrl)
  })

  test('should convert URI to URL', () => {
    const uri = {
      _type: 'uri' as const,
      scheme: 'https',
      host: {
        value: 'example.com',
        port: null,
      },
      authentication: null,
      location: {
        path: '/api/v1',
        query: 'format=json',
        fragment: null,
      },
    }

    const result = Urls.from(uri)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/api/v1')
    expect(result.location.pathSegments).toEqual(['api', 'v1'])
    expect(result.location.parameters).toEqual({
      format: 'json',
    })
  })

  test('should parse URL string literal', () => {
    const result = Urls.from('https://example.com/path?q=test#section' as any)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['path'])
    expect(result.location.parameters).toEqual({
      q: 'test',
    })
    expect(result.location.fragment).toBe('section')
  })

  test('should throw error for relative URL with host', () => {
    expect(() => {
      Urls.from({
        host: 'example.com',
        location: {
          pathSegments: ['path'],
          relative: true,
        },
      })
    }).toThrow()
  })
})

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
    expect(Urls.fromString('//john.lutteringer@www.google.com')).toEqual(
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
