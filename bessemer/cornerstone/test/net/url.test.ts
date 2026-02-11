import { Urls } from '@bessemer/cornerstone'
import { UrlLiteral } from '@bessemer/cornerstone/net/url'
import { UriParseMode } from '@bessemer/cornerstone/net/uri'

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
    expect(result.relative).toBe(false)
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
        password: null,
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
    expect(result.relative).toBe(false)
  })

  test('should build URL with relative path segments', () => {
    const result = Urls.from({
      location: {
        pathSegments: ['docs', 'guide'],
      },
      relative: true,
    })

    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.path).toBe('docs/guide')
    expect(result.relative).toBe(true)
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
    expect(result.relative).toBe(false)
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

  test('should build URL with only location', () => {
    const result = Urls.from({
      location: 'api/reference',
    })

    expect(result.href).toBe('api/reference')
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
      },
      relative: true,
    })

    expect(result.scheme).toBeNull()
    expect(result.host).toBeNull()
    expect(result.authentication).toBeNull()
    expect(result.location.pathSegments).toEqual(['assets', 'images', 'logo.png'])
    expect(result.location.path).toBe('assets/images/logo.png')
    expect(result.relative).toBe(true)
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
    expect(result.relative).toBe(false)
  })

  test('should return existing URL instance unchanged', () => {
    const originalUrl = Urls.from('https://example.com/path')
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
        },
        relative: true,
      })
    }).toThrow()
  })

  test('should parse HTTPS URL with host only', () => {
    expect(Urls.from('https://www.google.com')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  })

  test('should parse HTTPS URL with host and trailing slash', () => {
    expect(Urls.from('https://www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  })

  test('should parse protocol-relative URL with host only', () => {
    expect(Urls.from('//www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse misleading relative url as path', () => {
    expect(Urls.from('www.google.com')).toEqual(
      Urls.from({
        location: 'www.google.com',
      })
    )
  })

  test('should parse misleading url as host with permissive parsing', () => {
    expect(Urls.parseString('www.google.com', UriParseMode.Permissive)).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse protocol-relative URL with host only', () => {
    expect(Urls.from('//www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse protocol-relative URL with host and trailing slash', () => {
    expect(Urls.from('//www.google.com/')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  })

  test('should parse HTTP URL with localhost and port', () => {
    expect(Urls.from('http://localhost:8080')).toEqual(
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
    expect(Urls.from('http://localhost:8080/')).toEqual(
      Urls.from({
        scheme: 'http',
        host: 'localhost:8080',
      })
    )
  })

  test('should parse protocol-relative URL with localhost and port', () => {
    expect(Urls.from('//localhost:8080')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  })

  test('should parse protocol-relative URL with localhost, port and trailing slash', () => {
    expect(Urls.from('//localhost:8080/')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  })

  test('should parse HTTPS URL with authentication object', () => {
    expect(Urls.from('https://john.lutteringer:password123@www.google.com')).toEqual(
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
    expect(Urls.from('https://john.lutteringer:password123@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer:password123',
      })
    )
  })

  test('should parse HTTPS URL with authentication principal only', () => {
    expect(Urls.from('https://john.lutteringer@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer',
      })
    )
  })

  test('should parse URL with authentication without scheme', () => {
    expect(Urls.from('//john.lutteringer@www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
          password: null,
        },
      })
    )
  })

  test('should parse protocol-relative URL with authentication', () => {
    expect(Urls.from('//john.lutteringer:password123@www.google.com')).toEqual(
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
    expect(Urls.from('//www.google.com?q=Search%20Query')).toEqual(
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
    expect(Urls.from('/search?q=Search%20Query')).toEqual(
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
    expect(Urls.from('search?q=Search%20Query')).toEqual(
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

  test('should be able to build relative', () => {
    {
      const result = Urls.from({
        relative: true,
      })
      expect(result).toEqual(Urls.empty())
    }
    {
      const result = Urls.from({
        location: {
          path: '/relative/path',
        },
        relative: true,
      })
      expect(result.href).toEqual('relative/path')
    }
    {
      const result = Urls.from({
        location: {
          path: 'relative/path',
        },
        relative: true,
      })
      expect(result.href).toEqual('relative/path')
    }
    {
      expect(() =>
        Urls.from({
          host: 'example.com',
          location: {
            path: '/relative/path',
          },
          relative: true,
        })
      ).toThrow()
    }
  })
})

describe('Urls.format', () => {
  test('should format URL with scheme', () => {
    const url = Urls.from({
      scheme: 'https',
    })
    const result = Urls.format(url)

    expect(result).toBe('https:/')
  })

  test('should format URL with host', () => {
    const url = Urls.from({
      host: 'api.example.com',
    })
    const result = Urls.format(url)

    expect(result).toBe('//api.example.com')
  })

  test('should format URL scheme and host', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
    })
    const result = Urls.format(url)

    expect(result).toBe('https://api.example.com')
  })

  test('should format URL with absolute path segments', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        pathSegments: ['v1', 'users', '123'],
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://api.example.com/v1/users/123')
  })

  test('should format URL with relative path segments', () => {
    const url = Urls.from({
      location: {
        pathSegments: ['docs', 'guide'],
      },
      relative: true,
    })
    const result = Urls.format(url)

    expect(result).toBe('docs/guide')
  })

  test('should format empty absolute path', () => {
    const url = Urls.from({
      location: {
        pathSegments: [],
      },
    })
    const result = Urls.format(url)
    expect(result).toBe('/')
  })

  test('should format empty relative path', () => {
    const url = Urls.from({
      location: {
        pathSegments: [],
      },
      relative: true,
    })
    const result = Urls.format(url)

    expect(result).toBe('')
  })

  test('should format URL with encoded path segments (normalization)', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['user data', 'file name.txt', 'special@chars'],
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://example.com/user%20data/file%20name.txt/special%40chars')
  })

  test('should format URL with query parameters', () => {
    const url = Urls.from({
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
    const result = Urls.format(url)

    expect(result).toBe('https://search.example.com?q=typescript&page=2&limit=50')
  })

  test('should format URL with array query parameters (normalization)', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        parameters: {
          tags: ['javascript', 'typescript', 'react'],
          format: 'json',
        },
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://api.example.com?tags=javascript&tags=typescript&tags=react&format=json')
  })

  test('should format URL with encoded query parameters (normalization)', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'search.example.com',
      location: {
        parameters: {
          q: 'search query with spaces',
          filter: 'type=user&status=active',
        },
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://search.example.com?q=search%20query%20with%20spaces&filter=type%3Duser%26status%3Dactive')
  })

  test('should format URL with fragment', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'docs.example.com',
      location: {
        pathSegments: ['guide'],
        fragment: 'installation',
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://docs.example.com/guide#installation')
  })

  test('should format complex URL with all components (normalization)', () => {
    const url = Urls.from({
      scheme: 'https',
      authentication: {
        principal: 'api_user',
        password: 'secret123',
      },
      host: {
        value: 'secure.api.com',
        port: 443,
      },
      location: {
        pathSegments: ['v2', 'data reports', 'summary'],
        parameters: {
          format: 'json',
          filters: ['active', 'verified'],
          q: 'search term',
        },
        fragment: 'section-1',
      },
    })
    const result = Urls.format(url)

    expect(result).toBe(
      'https://api_user:secret123@secure.api.com:443/v2/data%20reports/summary?format=json&filters=active&filters=verified&q=search%20term#section-1'
    )
  })

  test('should format URL with IPv6 host', () => {
    const url = Urls.from({
      scheme: 'http',
      host: {
        value: '[2001:db8::1]',
        port: 8080,
      },
      location: {
        pathSegments: ['api', 'v1'],
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('http://[2001:db8::1]:8080/api/v1')
  })

  test('should format relative URL with no host or scheme', () => {
    const url = Urls.from({
      location: {
        pathSegments: ['assets', 'images', 'logo.png'],
      },
      relative: true,
    })
    const result = Urls.format(url)

    expect(result).toBe('assets/images/logo.png')
  })

  test('should format URL with empty path segments', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: [],
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('https://example.com')
  })

  test('should format URL created from string (normalization after parsing)', () => {
    const url = Urls.from('https://example.com/path with spaces?q=test query&arr[]=1&arr[]=2#section')
    const result = Urls.format(url)

    // The URL should be normalized after construction
    expect(result).toBe('https://example.com/path%20with%20spaces?q=test%20query&arr%5B%5D=1&arr%5B%5D=2#section')
  })

  test('should format URL with special characters requiring encoding (normalization)', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['path', 'with@symbols', 'and spaces'],
        parameters: {
          'param name': 'value with spaces',
          'special!param': 'value@with#symbols',
        },
        fragment: 'section with spaces',
      },
    })
    const result = Urls.format(url)

    expect(result).toBe(
      'https://example.com/path/with%40symbols/and%20spaces?param%20name=value%20with%20spaces&special!param=value%40with%23symbols#section%20with%20spaces'
    )
  })

  test('should format URL with protocol-relative components', () => {
    const url = Urls.from({
      host: 'cdn.example.com',
      location: {
        pathSegments: ['assets', 'app.js'],
      },
    })
    const result = Urls.format(url)

    expect(result).toBe('//cdn.example.com/assets/app.js')
  })

  test('should format URL maintaining order of query parameters as constructed', () => {
    const url = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        parameters: {
          z: 'last',
          a: 'first',
          m: 'middle',
        },
      },
    })
    const result = Urls.format(url)

    // Parameters should maintain the order they were specified in the object
    expect(result).toBe('https://example.com?z=last&a=first&m=middle')
  })
})

describe('Urls.update', () => {
  test('should update scheme into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'http',
      host: 'example.com',
      location: {
        pathSegments: ['api'],
      },
    })

    const result = Urls.update(baseUrl, {
      scheme: 'https',
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['api'])
  })

  test('should update host into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'old.example.com',
    })

    const result = Urls.update(baseUrl, {
      host: {
        value: 'new.example.com',
        port: 8080,
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('new.example.com')
    expect(result.host?.port).toBe(8080)
  })

  test('should update authentication into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
    })

    const result = Urls.update(baseUrl, {
      authentication: {
        principal: 'user',
        password: 'password',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('api.example.com')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('password')
  })

  test('should update path into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['old', 'path'],
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        path: '/new/path/segment',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/new/path/segment')
    expect(result.location.pathSegments).toEqual(['new', 'path', 'segment'])
  })

  test('should update pathSegments into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        pathSegments: ['v1'],
        parameters: { format: 'json' },
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        pathSegments: ['v2', 'users'],
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('api.example.com')
    expect(result.location.pathSegments).toEqual(['v2', 'users'])
    expect(result.location.path).toBe('/v2/users')
    expect(result.location.parameters).toEqual({ format: 'json' })
  })

  test('should update replace parameters', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'search.example.com',
      location: {
        pathSegments: ['search'],
        parameters: {
          q: 'old query',
          limit: '10',
        },
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        parameters: {
          q: 'new query',
          page: '2',
        },
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('search.example.com')
    expect(result.location.pathSegments).toEqual(['search'])
    expect(result.location.parameters).toEqual({
      q: 'new query',
      page: '2',
    })
  })

  test('should update fragment into existing URL', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'docs.example.com',
      location: {
        pathSegments: ['guide'],
        fragment: 'old-section',
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        fragment: 'new-section',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('docs.example.com')
    expect(result.location.pathSegments).toEqual(['guide'])
    expect(result.location.fragment).toBe('new-section')
  })

  test('should update multiple components simultaneously', () => {
    const baseUrl = Urls.from({
      scheme: 'http',
      host: 'old.example.com',
      location: {
        pathSegments: ['old'],
        parameters: { version: '1' },
      },
    })

    const result = Urls.update(baseUrl, {
      scheme: 'https',
      host: {
        value: 'new.example.com',
        port: 443,
      },
      authentication: {
        principal: 'admin',
      },
      location: {
        pathSegments: ['new', 'api'],
        parameters: {
          version: '2',
          format: 'json',
        },
        fragment: 'docs',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('new.example.com')
    expect(result.host?.port).toBe(443)
    expect(result.authentication?.principal).toBe('admin')
    expect(result.authentication?.password).toBeNull()
    expect(result.location.pathSegments).toEqual(['new', 'api'])
    expect(result.location.parameters).toEqual({
      version: '2',
      format: 'json',
    })
    expect(result.location.fragment).toBe('docs')
  })

  test('should update with URL string as base', () => {
    const result = Urls.update('https://example.com/path' as UrlLiteral, {
      location: {
        parameters: {
          q: 'search',
        },
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['path'])
    expect(result.location.parameters).toEqual({ q: 'search' })
  })

  test('should update with relative URL', () => {
    const baseUrl = Urls.from({
      location: {
        pathSegments: ['docs'],
      },
      relative: true,
    })

    const result = Urls.update(baseUrl, {
      location: {
        parameters: {
          tab: 'overview',
        },
      },
    })

    expect(result.scheme).toBeNull()
    expect(result.host).toBeNull()
    expect(result.location.pathSegments).toEqual(['docs'])
    expect(result.relative).toBe(true)
    expect(result.location.parameters).toEqual({ tab: 'overview' })
  })

  test('should update empty builder (no changes)', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['api'],
        parameters: { version: '1' },
      },
    })

    const result = Urls.update(baseUrl, {})

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['api'])
    expect(result.location.parameters).toEqual({ version: '1' })
  })

  test('should update with null values to clear components', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'example.com',
      authentication: {
        principal: 'user',
        password: 'pass',
      },
      location: {
        pathSegments: ['api'],
        parameters: { version: '1' },
        fragment: 'section',
      },
    })

    const result = Urls.update(baseUrl, {
      authentication: null,
      location: {
        fragment: null,
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication).toBeNull()
    expect(result.location.pathSegments).toEqual(['api'])
    expect(result.location.parameters).toEqual({ version: '1' })
    expect(result.location.fragment).toBeNull()
  })

  test('should deep update nested query parameters', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        parameters: {
          filters: ['active', 'verified'],
          sort: 'name',
          limit: '10',
        },
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        parameters: {
          filters: ['published'],
          page: '2',
        },
      },
    })

    expect(result.location.parameters).toEqual({
      filters: 'published',
      page: '2',
    })
  })

  test('should update with UrlBuilder as base', () => {
    const result = Urls.update(
      {
        scheme: 'http',
        host: 'localhost',
        location: {
          pathSegments: ['dev'],
        },
      },
      {
        scheme: 'https',
        location: {
          parameters: {
            debug: 'true',
          },
        },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('localhost')
    expect(result.location.pathSegments).toEqual(['dev'])
    expect(result.location.parameters).toEqual({ debug: 'true' })
  })

  test('should preserve original URL when merging (immutability)', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        pathSegments: ['original'],
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        pathSegments: ['modified'],
      },
    })

    expect(baseUrl.location.pathSegments).toEqual(['original'])
    expect(result.location.pathSegments).toEqual(['modified'])
    expect(result).not.toBe(baseUrl)
  })

  test('should update complex nested location properties', () => {
    const baseUrl = Urls.from({
      scheme: 'https',
      host: 'complex.example.com',
      location: {
        pathSegments: ['api', 'v1'],
        parameters: {
          format: 'json',
          include: ['metadata', 'content'],
        },
        fragment: 'section1',
      },
    })

    const result = Urls.update(baseUrl, {
      location: {
        pathSegments: ['api', 'v2', 'advanced'],
        parameters: {
          format: 'xml',
          exclude: ['debug'],
          limit: '50',
        },
        fragment: 'section2',
      },
    })

    expect(result.location.pathSegments).toEqual(['api', 'v2', 'advanced'])
    expect(result.location.parameters).toEqual({
      format: 'xml',
      exclude: 'debug',
      limit: '50',
    })
    expect(result.location.fragment).toBe('section2')
  })

  test('should be able to update relative', () => {
    const baseUrl = Urls.from('//example.com/absolute/path?query=1')

    {
      const result = Urls.update(baseUrl, {
        relative: true,
      })
      expect(result.href).toEqual('absolute/path?query=1')
    }
    {
      const result = Urls.update(baseUrl, {
        location: {
          pathSegments: ['relative', 'path'],
        },
        relative: true,
      })
      expect(result.href).toEqual('relative/path?query=1')
    }
    {
      const result = Urls.update(baseUrl, {
        location: {
          path: 'relative/path',
        },
        relative: true,
      })
      expect(result.href).toEqual('relative/path?query=1')
    }
    {
      const result = Urls.update(baseUrl, {
        location: {
          path: 'relative/path',
        },
      })
      expect(result.href).toEqual('//example.com/relative/path?query=1')
    }
    {
      const result = Urls.update(baseUrl, {
        location: {
          path: '/relative/path',
        },
        relative: true,
      })
      expect(result.href).toEqual('relative/path?query=1')
    }
  })
})

describe('Urls.navigate', () => {
  test('should navigate to absolute URL from base', () => {
    const base = Urls.from('https://example.com/path/to/page')
    const result = Urls.navigate(base, 'https://other.com/new/path' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('other.com')
    expect(result.location.pathSegments).toEqual(['new', 'path'])
  })

  test('should navigate to relative path from base', () => {
    const base = Urls.from('https://example.com/docs/guide')
    const result = Urls.navigate(base, 'api/reference' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide', 'api', 'reference'])
    expect(result.location.path).toBe('/docs/guide/api/reference')
  })

  test('should navigate to absolute path from base', () => {
    const base = Urls.from('https://example.com/docs/guide')
    const result = Urls.navigate(base, '/api/reference' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['api', 'reference'])
    expect(result.location.path).toBe('/api/reference')
  })

  test('should navigate with query parameters', () => {
    const base = Urls.from('https://example.com/docs')
    const result = Urls.navigate(base, '/api?version=v2' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['api'])
    expect(result.location.parameters).toEqual({ version: 'v2' })
  })

  test('should navigate with fragment', () => {
    const base = Urls.from('https://example.com/docs')
    const result = Urls.navigate(base, '/api#introduction' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['api'])
    expect(result.location.fragment).toBe('introduction')
  })

  test('should replace query and fragment on navigation', () => {
    const base = Urls.from('https://example.com/docs?old=query#old-section')
    const result = Urls.navigate(base, 'guide?new=param#new-section' as UrlLiteral)

    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.parameters).toEqual({ new: 'param' })
    expect(result.location.fragment).toBe('new-section')
  })

  test('should navigate from root to relative path', () => {
    const base = Urls.from('https://example.com/')
    const result = Urls.navigate(base, 'docs/guide' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.path).toBe('/docs/guide')
  })

  test('should navigate with nested relative paths', () => {
    const base = Urls.from('https://example.com/docs/api')
    const result = Urls.navigate(base, 'v2/users/123' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'api', 'v2', 'users', '123'])
    expect(result.location.path).toBe('/docs/api/v2/users/123')
  })

  test('should navigate to protocol-relative URL', () => {
    const base = Urls.from('https://example.com/path')
    const result = Urls.navigate(base, '//cdn.other.com/assets/app.js' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('cdn.other.com')
    expect(result.location.pathSegments).toEqual(['assets', 'app.js'])
  })

  test('should navigate to different scheme', () => {
    const base = Urls.from('https://example.com/secure')
    const result = Urls.navigate(base, 'http://example.com/public' as UrlLiteral)

    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['public'])
  })

  test('should clear authentication when navigating to different host', () => {
    const base = Urls.from('https://user:pass@example.com/private')
    const result = Urls.navigate(base, 'https://other.com/public' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('other.com')
    expect(result.authentication).toBeNull()
    expect(result.location.pathSegments).toEqual(['public'])
  })

  test('should preserve authentication when navigating on same host', () => {
    const base = Urls.from('https://user:pass@example.com/private')
    const result = Urls.navigate(base, '/other-private' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('pass')
    expect(result.location.pathSegments).toEqual(['other-private'])
  })

  test('should handle navigation with UrlBuilder as next', () => {
    const base = Urls.from('https://example.com/docs')
    const result = Urls.navigate(base, {
      location: {
        pathSegments: ['api', 'reference'],
      },
      relative: true,
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'api', 'reference'])
  })

  test('should handle navigation with UrlBuilder as base', () => {
    const result = Urls.navigate(
      {
        scheme: 'https',
        host: 'example.com',
        location: { pathSegments: ['docs'] },
      },
      'guide' as UrlLiteral
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
  })

  test('should navigate from URL with port', () => {
    const base = Urls.from('http://localhost:8080/app')
    const result = Urls.navigate(base, 'api/users' as UrlLiteral)

    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('localhost')
    expect(result.host?.port).toBe(8080)
    expect(result.location.pathSegments).toEqual(['app', 'api', 'users'])
  })

  test('should navigate to URL with different port', () => {
    const base = Urls.from('http://localhost:8080/app')
    const result = Urls.navigate(base, 'http://localhost:9000/other' as UrlLiteral)

    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('localhost')
    expect(result.host?.port).toBe(9000)
    expect(result.location.pathSegments).toEqual(['other'])
  })

  test('should navigate from IPv6 host', () => {
    const base = Urls.from('http://[2001:db8::1]:8080/api')
    const result = Urls.navigate(base, 'v2/users' as UrlLiteral)

    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('[2001:db8::1]')
    expect(result.host?.port).toBe(8080)
    expect(result.location.pathSegments).toEqual(['api', 'v2', 'users'])
  })

  test('should navigate with encoded path segments', () => {
    const base = Urls.from('https://example.com/folder')
    const result = Urls.navigate(base, {
      location: {
        pathSegments: ['file name', 'with spaces'],
      },
      relative: true,
    })

    expect(result.location.pathSegments).toEqual(['folder', 'file name', 'with spaces'])
    expect(result.location.path).toBe('/folder/file%20name/with%20spaces')
  })

  test('should navigate to fragment only', () => {
    const base = Urls.from('https://example.com/docs/guide?tab=api')
    const result = Urls.navigate(base, '#section-2' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.parameters).toEqual({ tab: 'api' })
    expect(result.location.fragment).toBe('section-2')
  })

  test('should navigate to query only', () => {
    const base = Urls.from('https://example.com/search')
    const result = Urls.navigate(base, '?q=typescript' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['search'])
    expect(result.location.parameters).toEqual({ q: 'typescript' })
  })

  test('should navigate from base with no path', () => {
    const base = Urls.from('https://example.com')
    const result = Urls.navigate(base, 'docs/guide' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
    expect(result.location.path).toBe('/docs/guide')
  })

  test('should navigate with empty relative path', () => {
    const base = Urls.from('https://example.com/docs/guide')
    const result = Urls.navigate(base, '' as UrlLiteral)

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.pathSegments).toEqual(['docs', 'guide'])
  })

  test('should simulate browser navigation: relative link from page', () => {
    const base = Urls.from('https://example.com/products/electronics/laptops')
    const result = Urls.navigate(base, 'accessories' as UrlLiteral)

    expect(result.href).toBe('https://example.com/products/electronics/laptops/accessories')
  })

  test('should simulate browser navigation: absolute link from page', () => {
    const base = Urls.from('https://example.com/products/electronics/laptops')
    const result = Urls.navigate(base, '/about' as UrlLiteral)

    expect(result.href).toBe('https://example.com/about')
  })

  test('should simulate browser navigation: external link', () => {
    const base = Urls.from('https://example.com/page')
    const result = Urls.navigate(base, 'https://external.com/resource' as UrlLiteral)

    expect(result.href).toBe('https://external.com/resource')
  })

  test('should simulate browser navigation: query string update', () => {
    const base = Urls.from('https://example.com/search?q=javascript')
    const result = Urls.navigate(base, '?q=typescript&sort=date' as UrlLiteral)

    expect(result.href).toBe('https://example.com/search?q=typescript&sort=date')
  })

  test('should simulate browser navigation: hash/fragment change', () => {
    const base = Urls.from('https://example.com/docs#intro')
    const result = Urls.navigate(base, '#advanced' as UrlLiteral)

    expect(result.href).toBe('https://example.com/docs#advanced')
  })

  test('should handle complex multi-step navigation', () => {
    let current = Urls.from('https://example.com/')

    current = Urls.navigate(current, 'docs' as UrlLiteral)
    expect(current.href).toBe('https://example.com/docs')

    current = Urls.navigate(current, 'api' as UrlLiteral)
    expect(current.href).toBe('https://example.com/docs/api')

    current = Urls.navigate(current, '/guide' as UrlLiteral)
    expect(current.href).toBe('https://example.com/guide')

    current = Urls.navigate(current, 'v2/reference' as UrlLiteral)
    expect(current.href).toBe('https://example.com/guide/v2/reference')
  })

  test('should preserve scheme when navigating with relative URL', () => {
    const base = Urls.from('ftp://files.example.com/public')
    const result = Urls.navigate(base, 'documents/readme.txt' as UrlLiteral)

    expect(result.scheme).toBe('ftp')
    expect(result.host?.value).toBe('files.example.com')
    expect(result.location.pathSegments).toEqual(['public', 'documents', 'readme.txt'])
  })

  test('should handle navigation with complex query parameters', () => {
    const base = Urls.from('https://api.example.com/search')
    const result = Urls.navigate(base, {
      location: {
        pathSegments: ['results'],
        parameters: {
          filters: ['active', 'verified'],
          sort: 'date',
          limit: '50',
        },
      },
      relative: true,
    })

    expect(result.location.pathSegments).toEqual(['search', 'results'])
    expect(result.location.parameters).toEqual({
      filters: ['active', 'verified'],
      sort: 'date',
      limit: '50',
    })
  })

  test('should clear authentication when navigating to absolute URL on different host', () => {
    const base = Urls.from('https://admin:secret@internal.example.com/admin')
    const result = Urls.navigate(base, 'https://public.example.com/info' as UrlLiteral)

    expect(result.authentication).toBeNull()
  })

  test('should update authentication when provided in navigation target', () => {
    const base = Urls.from('https://example.com/page')
    const result = Urls.navigate(base, {
      host: 'example.com',
      authentication: { principal: 'newuser', password: 'newpass' },
      location: { path: '/secure' },
    })

    expect(result.authentication?.principal).toBe('newuser')
    expect(result.authentication?.password).toBe('newpass')
  })
})
