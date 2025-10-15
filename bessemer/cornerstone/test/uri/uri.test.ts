import { Uris } from '@bessemer/cornerstone'
import { UriComponentType } from '@bessemer/cornerstone/uri/uri'

describe('Uris.from', () => {
  test('should build URI with scheme and host object', () => {
    const result = Uris.from({
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
  })

  test('should build URI with scheme and host string', () => {
    const result = Uris.from({
      scheme: 'https',
      host: 'example.com:9000',
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBe(9000)
  })

  test('should build URI with authentication object', () => {
    const result = Uris.from({
      scheme: 'ftp',
      host: 'fileserver.com',
      authentication: {
        principal: 'user123',
        password: 'secret456',
      },
    })

    expect(result.authentication?.principal).toBe('user123')
    expect(result.authentication?.password).toBe('secret456')
  })

  test('should build URI with authentication string', () => {
    const result = Uris.from({
      scheme: 'ftp',
      host: 'fileserver.com',
      authentication: 'admin:password',
    })

    expect(result.authentication?.principal).toBe('admin')
    expect(result.authentication?.password).toBe('password')
  })

  test('should build URI with authentication principal only', () => {
    const result = Uris.from({
      scheme: 'ssh',
      host: 'server.com',
      authentication: {
        principal: 'root',
      },
    })

    expect(result.authentication?.principal).toBe('root')
    expect(result.authentication?.password).toBeNull()
  })

  test('should build URI with location object', () => {
    const result = Uris.from({
      scheme: 'https',
      host: 'api.example.com',
      location: {
        path: '/v1/users',
        query: 'limit=10&page=2',
        fragment: 'section1',
      },
    })

    expect(result.location.path).toBe('/v1/users')
    expect(result.location.query).toBe('limit=10&page=2')
    expect(result.location.fragment).toBe('section1')
  })

  test('should build URI with location string', () => {
    const result = Uris.from({
      scheme: 'https',
      host: 'docs.example.com',
      location: '/guide/getting-started?tab=overview#installation',
    })

    expect(result.location.path).toBe('/guide/getting-started')
    expect(result.location.query).toBe('tab=overview')
    expect(result.location.fragment).toBe('installation')
  })

  test('should build complex URI with all components as objects', () => {
    const result = Uris.from({
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
        path: '/v2/data/reports',
        query: 'format=json&year=2024',
        fragment: 'summary',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.authentication?.principal).toBe('api_user')
    expect(result.authentication?.password).toBe('token123')
    expect(result.host?.value).toBe('secure.api.com')
    expect(result.host?.port).toBe(443)
    expect(result.location.path).toBe('/v2/data/reports')
    expect(result.location.query).toBe('format=json&year=2024')
    expect(result.location.fragment).toBe('summary')
  })

  test('should build URI with minimal components', () => {
    const result = Uris.from({
      scheme: 'tel',
      location: {
        path: '+1234567890',
      },
    })

    expect(result.scheme).toBe('tel')
    expect(result.host).toBeNull()
    expect(result.authentication).toBeNull()
    expect(result.location.path).toBe('+1234567890')
    expect(result.location.query).toBeNull()
    expect(result.location.fragment).toBeNull()
  })

  test('should build URI with IPv6 host', () => {
    const result = Uris.from({
      scheme: 'http',
      host: {
        value: '[2001:db8::1]',
        port: 8080,
      },
      location: {
        path: '/api/v1',
      },
    })

    expect(result.host?.value).toBe('[2001:db8::1]')
    expect(result.host?.port).toBe(8080)
  })

  test('should build URN with path only', () => {
    const result = Uris.from({
      scheme: 'urn',
      location: {
        path: 'isbn:0451450523',
      },
    })

    expect(result.scheme).toBe('urn')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('isbn:0451450523')
  })
})

describe('Uris.fromString', () => {
  test('should parse telephone URI with path', () => {
    expect(Uris.fromString('tel:+1-816-555-1212')).toEqual(
      Uris.from({
        scheme: 'tel',
        location: {
          path: '+1-816-555-1212',
        },
      })
    )
  })

  test('should parse telephone URI with empty query and fragment', () => {
    expect(Uris.fromString('tel:+1-816-555-1212?#')).toEqual(
      Uris.from({
        scheme: 'tel',
        location: '+1-816-555-1212',
      })
    )
  })

  test('should parse telephone URI with fragment', () => {
    expect(Uris.fromString('tel:+1-816-555-1212?#fragment')).toEqual(
      Uris.from({
        scheme: 'tel',
        location: {
          path: '+1-816-555-1212',
          fragment: 'fragment',
        },
      })
    )
  })

  test('should parse telnet URI with host object and path', () => {
    expect(Uris.fromString('telnet://192.0.2.16:80/')).toEqual(
      Uris.from({
        scheme: 'telnet',
        host: {
          value: '192.0.2.16',
          port: 80,
        },
        location: {
          path: '/',
        },
      })
    )
  })

  test('should parse telnet URI with host string', () => {
    expect(Uris.fromString('telnet://192.0.2.16:80')).toEqual(
      Uris.from({
        scheme: 'telnet',
        host: '192.0.2.16:80',
      })
    )
  })

  test('should parse URN with location string', () => {
    expect(Uris.fromString('urn:oasis:names:specification:docbook:dtd:xml:4.1.2')).toEqual(
      Uris.from({
        scheme: 'urn',
        location: 'oasis:names:specification:docbook:dtd:xml:4.1.2',
      })
    )
  })

  test('should parse news URI with path', () => {
    expect(Uris.fromString('news:comp.infosystems.www.servers.unix')).toEqual(
      Uris.from({
        scheme: 'news',
        location: {
          path: 'comp.infosystems.www.servers.unix',
        },
      })
    )
  })

  test('should parse LDAP URI with IPv6 host and query', () => {
    expect(Uris.fromString('ldap://[2001:db8::7]/c=GB?objectClass?one')).toEqual(
      Uris.from({
        scheme: 'ldap',
        host: {
          value: '[2001:db8::7]',
        },
        location: {
          path: '/c=GB',
          query: 'objectClass?one',
        },
      })
    )
  })

  test('should parse LDAP URI with IPv6 host, port and query', () => {
    expect(Uris.fromString('ldap://[2001:db8::7]:389/c=GB?objectClass?one')).toEqual(
      Uris.from({
        scheme: 'ldap',
        host: {
          value: '[2001:db8::7]',
          port: 389,
        },
        location: {
          path: '/c=GB',
          query: 'objectClass?one',
        },
      })
    )
  })

  test('should parse complex HTTPS URI with all components', () => {
    expect(Uris.fromString('https://john.doe@www.example.com:1234/forum/questions/?tag=networking&order=newest#:~:text=whatever')).toEqual(
      Uris.from({
        scheme: 'https',
        authentication: {
          principal: 'john.doe',
        },
        host: {
          value: 'www.example.com',
          port: 1234,
        },
        location: {
          path: '/forum/questions/',
          query: 'tag=networking&order=newest',
          fragment: ':~:text=whatever',
        },
      })
    )
  })

  test('should parse IPV6 address', () => {
    expect(Uris.fromString('https://[2001:db8::1]/path')).toEqual(
      Uris.from({
        scheme: 'https',
        host: { value: '[2001:db8::1]' },
        location: { path: '/path' },
      })
    )
  })

  test('should parse URI with unusual but valid path characters', () => {
    const result = Uris.fromString('::://@@@:::')
    expect(result.scheme).toBeNull()
    expect(result.host).toBeNull()
    expect(result.authentication).toBeNull()
    expect(result.location.path).toBe('::://@@@:::')
    expect(result.location.query).toBeNull()
    expect(result.location.fragment).toBeNull()
  })

  test('should throw error for malformed authentication with colon but no username', () => {
    expect(() => Uris.fromString('https://:password@example.com')).toThrow()
  })

  test('should throw error for malformed host with colon but no hostname', () => {
    expect(() => Uris.fromString('https://:8080/path')).toThrow()
  })

  test('should throw error for incomplete IPv6 address without closing bracket', () => {
    expect(() => Uris.fromString('https://[2001:db8::1/path')).toThrow()
  })

  test('should throw error for invalid port number', () => {
    expect(() => Uris.fromString('https://example.com:abc/path')).toThrow()
  })

  test('should throw error for authentication with only colon', () => {
    expect(() => Uris.fromString('ftp://:@example.com')).toThrow()
  })

  test('should throw error for malformed IPv6 with port but missing closing bracket', () => {
    expect(() => Uris.fromString('http://[::1:8080/path')).toThrow()
  })

  test('should throw error for host starting with colon only', () => {
    expect(() => Uris.fromString('http://:/')).toThrow()
  })

  test('should throw for URI with invalid scheme characters', () => {
    expect(() => Uris.fromString('ht tp://example.com')).toThrow()
  })

  test('should throw error for authentication section with multiple consecutive colons', () => {
    expect(() => Uris.fromString('https://user::pass@example.com')).toThrow()
  })

  test('should throw error for invalid characters in scheme', () => {
    expect(() => Uris.fromString('ht@tp://example.com')).toThrow()
  })
})

describe('Uris.merge', () => {
  test('should merge scheme into existing URI', () => {
    const baseUri = Uris.from({
      host: 'example.com',
      location: { path: '/api' },
    })

    const result = Uris.merge(baseUri, {
      scheme: 'https',
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        location: { path: '/api' },
      })
    )
  })

  test('should merge host into existing URI', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      location: { path: '/api' },
    })

    const result = Uris.merge(baseUri, {
      host: 'api.example.com:8080',
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: {
          value: 'api.example.com',
          port: 8080,
        },
        location: { path: '/api' },
      })
    )
  })

  test('should merge authentication into existing URI', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
    })

    const result = Uris.merge(baseUri, {
      authentication: {
        principal: 'user',
        password: 'pass',
      },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        authentication: {
          principal: 'user',
          password: 'pass',
        },
      })
    )
  })

  test('should merge location path into existing URI', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: { query: 'param=value' },
    })

    const result = Uris.merge(baseUri, {
      location: { path: '/new-path' },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        location: {
          path: '/new-path',
          query: 'param=value',
        },
      })
    )
  })

  test('should merge complete location object', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
    })

    const result = Uris.merge(baseUri, {
      location: {
        path: '/api/v1',
        query: 'format=json',
        fragment: 'section1',
      },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        location: {
          path: '/api/v1',
          query: 'format=json',
          fragment: 'section1',
        },
      })
    )
  })

  test('should override existing values when merging', () => {
    const baseUri = Uris.from({
      scheme: 'http',
      host: 'old.example.com',
      location: { path: '/old-path' },
    })

    const result = Uris.merge(baseUri, {
      scheme: 'https',
      host: 'new.example.com',
      location: { path: '/new-path' },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'new.example.com',
        location: { path: '/new-path' },
      })
    )
  })

  test('should merge multiple components at once', () => {
    const baseUri = Uris.from({
      scheme: 'http',
      host: 'example.com',
    })

    const result = Uris.merge(baseUri, {
      scheme: 'https',
      authentication: 'admin:secret',
      location: {
        path: '/secure',
        fragment: 'top',
      },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        authentication: {
          principal: 'admin',
          password: 'secret',
        },
        location: {
          path: '/secure',
          fragment: 'top',
        },
      })
    )
  })

  test('should preserve null values when merging', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      authentication: {
        principal: 'user',
        password: 'oldpass',
      },
    })

    const result = Uris.merge(baseUri, {
      authentication: {
        principal: 'user',
        password: null,
      },
    })

    expect(result.authentication?.password).toBeNull()
  })

  test('should deep merge location properties', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/api',
        query: 'version=1',
      },
    })

    const result = Uris.merge(baseUri, {
      location: {
        fragment: 'docs',
      },
    })

    expect(result).toEqual(
      Uris.from({
        scheme: 'https',
        host: 'example.com',
        location: {
          path: '/api',
          query: 'version=1',
          fragment: 'docs',
        },
      })
    )
  })

  test('should handle empty merge builder', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: { path: '/test' },
    })

    const result = Uris.merge(baseUri, {})

    expect(result).toEqual(baseUri)
  })
})

describe('Uris.fromString', () => {
  test('should parse simple HTTP URI', () => {
    const result = Uris.fromString('https://example.com')
    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBeNull()
    expect(result.authentication).toBeNull()
    expect(result.location.path).toBeNull()
  })

  test('should parse URI with port', () => {
    const result = Uris.fromString('https://example.com:8080/path')
    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBe(8080)
    expect(result.location.path).toBe('/path')
  })

  test('should parse URI with authentication', () => {
    const result = Uris.fromString('ftp://user:pass@ftp.example.com')
    expect(result.scheme).toBe('ftp')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('pass')
    expect(result.host?.value).toBe('ftp.example.com')
  })

  test('should parse URI with authentication principal only', () => {
    const result = Uris.fromString('ssh://admin@server.com')
    expect(result.scheme).toBe('ssh')
    expect(result.authentication?.principal).toBe('admin')
    expect(result.authentication?.password).toBeNull()
    expect(result.host?.value).toBe('server.com')
  })

  test('should parse URI with query parameters', () => {
    const result = Uris.fromString('https://api.example.com/users?page=1&limit=10')
    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('api.example.com')
    expect(result.location.path).toBe('/users')
    expect(result.location.query).toBe('page=1&limit=10')
  })

  test('should parse URI with fragment', () => {
    const result = Uris.fromString('https://docs.example.com/guide#installation')
    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('docs.example.com')
    expect(result.location.path).toBe('/guide')
    expect(result.location.fragment).toBe('installation')
  })

  test('should parse URI with all components', () => {
    const result = Uris.fromString('https://user:pass@api.example.com:443/v1/data?format=json#results')
    expect(result.scheme).toBe('https')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('pass')
    expect(result.host?.value).toBe('api.example.com')
    expect(result.host?.port).toBe(443)
    expect(result.location.path).toBe('/v1/data')
    expect(result.location.query).toBe('format=json')
    expect(result.location.fragment).toBe('results')
  })

  test('should parse IPv6 URI', () => {
    const result = Uris.fromString('http://[2001:db8::1]:8080/path')
    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('[2001:db8::1]')
    expect(result.host?.port).toBe(8080)
    expect(result.location.path).toBe('/path')
  })

  test('should parse telephone URI', () => {
    const result = Uris.fromString('tel:+1-800-555-1212')
    expect(result.scheme).toBe('tel')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('+1-800-555-1212')
  })

  test('should parse mailto URI', () => {
    const result = Uris.fromString('mailto:user@example.com')
    expect(result.scheme).toBe('mailto')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('user@example.com')
  })

  test('should parse URN', () => {
    const result = Uris.fromString('urn:isbn:0451450523')
    expect(result.scheme).toBe('urn')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('isbn:0451450523')
  })

  test('should parse file URI 1', () => {
    const result = Uris.fromString('file:///path/to/file.txt')
    expect(result.scheme).toBe('file')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('/path/to/file.txt')
  })

  test('should parse file URI 2', () => {
    const result = Uris.fromString('file://localhost/etc/fstab')
    expect(result.scheme).toBe('file')
    expect(result.host?.value).toBe('localhost')
    expect(result.location.path).toBe('/etc/fstab')
  })

  test('should parse file URI 3', () => {
    const result = Uris.fromString('file:///etc/fstab')
    expect(result.scheme).toBe('file')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('/etc/fstab')
  })

  test('should parse file URI 4', () => {
    const result = Uris.fromString('file://localhost/c:/WINDOWS/clock.avi')
    expect(result.scheme).toBe('file')
    expect(result.host?.value).toBe('localhost')
    expect(result.location.path).toBe('/c:/WINDOWS/clock.avi')
  })

  test('should parse file URI 5', () => {
    const result = Uris.fromString('file:///c:/WINDOWS/clock.avi')
    expect(result.scheme).toBe('file')
    expect(result.host).toBeNull()
    expect(result.location.path).toBe('/c:/WINDOWS/clock.avi')
  })

  test('should parse URI with encoded characters', () => {
    const result = Uris.fromString('https://example.com/path%20with%20spaces?query%3Dvalue')
    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/path%20with%20spaces')
    expect(result.location.query).toBe('query%3Dvalue')
  })

  test('should parse localhost URI', () => {
    const result = Uris.fromString('http://localhost:3000/app')
    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('localhost')
    expect(result.host?.port).toBe(3000)
    expect(result.location.path).toBe('/app')
  })

  test('should parse IP address URI', () => {
    const result = Uris.fromString('http://192.168.1.1:8080/api')
    expect(result.scheme).toBe('http')
    expect(result.host?.value).toBe('192.168.1.1')
    expect(result.host?.port).toBe(8080)
    expect(result.location.path).toBe('/api')
  })

  test('should parse URI with root path', () => {
    const result = Uris.fromString('https://example.com/')
    expect(result.location.path).toBe('/')
  })

  test('should parse URI with empty query', () => {
    const result = Uris.fromString('https://example.com/path?')
    expect(result.location.query).toBe(null)
  })

  test('should parse URI with empty fragment', () => {
    const result = Uris.fromString('https://example.com/path#')
    expect(result.location.fragment).toBe(null)
  })

  test('should parse URI with complex fragment', () => {
    const result = Uris.fromString('https://example.com/page#:~:text=hello%20world')
    expect(result.location.fragment).toBe(':~:text=hello%20world')
  })

  test('should throw for empty string', () => {
    expect(() => Uris.fromString('')).toThrow()
    expect(() => Uris.fromString('   ')).toThrow()
  })

  test('should throw for invalid scheme characters', () => {
    expect(() => Uris.fromString('ht@tp://example.com')).toThrow()
  })

  test('should throw for malformed authentication', () => {
    expect(() => Uris.fromString('https://:password@example.com')).toThrow()
  })

  test('should throw for invalid port', () => {
    expect(() => Uris.fromString('https://example.com:abc/path')).toThrow()
  })

  test('should throw for incomplete IPv6 address', () => {
    expect(() => Uris.fromString('https://[2001:db8::1/path')).toThrow()
  })

  test('should throw for malformed host', () => {
    expect(() => Uris.fromString('https://:8080/path')).toThrow()
  })

  test('should throw for invalid characters in authentication', () => {
    expect(() => Uris.fromString('https://user name:pass@example.com')).toThrow()
  })

  test('should throw for multiple consecutive colons in authentication', () => {
    expect(() => Uris.fromString('https://user::pass@example.com')).toThrow()
  })

  test('should throw for invalid IPv6 format', () => {
    expect(() => Uris.fromString('https://[invalid:ipv6::format]/path')).toThrow()
  })
})

describe('Uris.format', () => {
  test('should format complete URI with all components', () => {
    const uri = Uris.from({
      scheme: 'https',
      authentication: {
        principal: 'user',
        password: 'pass',
      },
      host: {
        value: 'example.com',
        port: 8080,
      },
      location: {
        path: '/path',
        query: 'q=test',
        fragment: 'section',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('https://user:pass@example.com:8080/path?q=test#section')
  })

  test('should format URI with scheme and host only', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
    })

    const result = Uris.format(uri)
    expect(result).toBe('https://example.com')
  })

  test('should format URI with authentication but no password', () => {
    const uri = Uris.from({
      scheme: 'ftp',
      authentication: {
        principal: 'user',
      },
      host: 'server.com',
    })

    const result = Uris.format(uri)
    expect(result).toBe('ftp://user@server.com')
  })

  test('should format URI with host and port', () => {
    const uri = Uris.from({
      scheme: 'http',
      host: {
        value: 'localhost',
        port: 3000,
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('http://localhost:3000')
  })

  test('should format URI with IPv6 host', () => {
    const uri = Uris.from({
      scheme: 'http',
      host: {
        value: '[2001:db8::1]',
        port: 8080,
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('http://[2001:db8::1]:8080')
  })

  test('should format URI with only path', () => {
    const uri = Uris.from({
      location: {
        path: '/api/users',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('/api/users')
  })

  test('should format URI with path and query', () => {
    const uri = Uris.from({
      location: {
        path: '/search',
        query: 'q=test&type=all',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('/search?q=test&type=all')
  })

  test('should format URI with path and fragment', () => {
    const uri = Uris.from({
      location: {
        path: '/docs',
        fragment: 'introduction',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('/docs#introduction')
  })

  test('should format URN with scheme and path', () => {
    const uri = Uris.from({
      scheme: 'urn',
      location: {
        path: 'isbn:0451450523',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('urn:isbn:0451450523')
  })

  test('should format telephone URI', () => {
    const uri = Uris.from({
      scheme: 'tel',
      location: {
        path: '+1-816-555-1212',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('tel:+1-816-555-1212')
  })

  test('should encode authentication credentials', () => {
    const uri = Uris.from({
      scheme: 'https',
      authentication: {
        principal: 'user@domain',
        password: 'p@ssw0rd!',
      },
      host: 'example.com',
    })

    const result = Uris.format(uri)
    expect(result).toBe('https://user%40domain:p%40ssw0rd!@example.com')
  })

  test('should exclude scheme when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Scheme])
    expect(result).toBe('//example.com/path')
  })

  test('should exclude host when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Host])
    expect(result).toBe('https:/path')
  })

  test('should exclude authentication when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      authentication: {
        principal: 'user',
        password: 'pass',
      },
      host: 'example.com',
    })

    const result = Uris.format(uri, [UriComponentType.Authentication])
    expect(result).toBe('https://example.com')
  })

  test('should exclude location when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
        query: 'q=test',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Location])
    expect(result).toBe('https://example.com')
  })

  test('should exclude path when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
        query: 'q=test',
        fragment: 'blah',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Path])
    expect(result).toBe('https://example.com?q=test#blah')
  })

  test('should exclude query when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
        query: 'q=test',
        fragment: 'blah',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Query])
    expect(result).toBe('https://example.com/path#blah')
  })

  test('should exclude fragment when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      host: 'example.com',
      location: {
        path: '/path',
        query: 'q=test',
        fragment: 'blah',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Fragment])
    expect(result).toBe('https://example.com/path?q=test')
  })

  test('should exclude multiple components when specified', () => {
    const uri = Uris.from({
      scheme: 'https',
      authentication: {
        principal: 'user',
        password: 'pass',
      },
      host: 'example.com',
      location: {
        path: '/path',
      },
    })

    const result = Uris.format(uri, [UriComponentType.Scheme, UriComponentType.Authentication])
    expect(result).toBe('//example.com/path')
  })

  test('should handle empty URI components', () => {
    const uri = Uris.from({
      location: {},
    })

    const result = Uris.format(uri)
    expect(result).toBe('')
  })

  test('should format URI with only query', () => {
    const uri = Uris.from({
      location: {
        query: 'search=test',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('?search=test')
  })

  test('should format URI with only fragment', () => {
    const uri = Uris.from({
      location: {
        fragment: 'section1',
      },
    })

    const result = Uris.format(uri)
    expect(result).toBe('#section1')
  })
})

describe('Uris.merge', () => {
  test('should merge scheme into existing URI', () => {
    const result = Uris.merge(
      {
        host: 'example.com',
        location: { path: '/api' },
      },
      {
        scheme: 'https',
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/api')
  })

  test('should merge host into existing URI', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        location: { path: '/api' },
      },
      {
        host: 'api.example.com',
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('api.example.com')
    expect(result.location.path).toBe('/api')
  })

  test('should merge authentication into existing URI', () => {
    const baseUri = Uris.from({
      scheme: 'https',
      host: 'example.com',
    })

    const result = Uris.merge(baseUri, {
      authentication: {
        principal: 'user',
        password: 'pass',
      },
    })

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('pass')
  })

  test('should merge location path into existing URI', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        location: { path: '/existing-path', query: 'existing=true' },
      },
      {
        location: { path: '/new-path' },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/new-path')
    expect(result.location.query).toBe('existing=true')
  })

  test('should merge location query into existing URI', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        location: { path: '/api' },
      },
      {
        location: { query: 'new=param' },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/api')
    expect(result.location.query).toBe('new=param')
  })

  test('should merge location fragment into existing URI', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        location: { path: '/docs' },
      },
      {
        location: { fragment: 'section1' },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/docs')
    expect(result.location.fragment).toBe('section1')
  })

  test('should override existing scheme', () => {
    const result = Uris.merge(
      {
        scheme: 'http',
        host: 'example.com',
      },
      {
        scheme: 'https',
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
  })

  test('should merge multiple components at once', () => {
    const result = Uris.merge(
      {
        host: 'example.com',
        location: { path: '/api' },
      },
      {
        scheme: 'https',
        authentication: { principal: 'user' },
        location: { query: 'version=v1' },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication?.principal).toBe('user')
    expect(result.location.path).toBe('/api')
    expect(result.location.query).toBe('version=v1')
  })

  test('should handle merging with empty builder', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        location: { path: '/api' },
      },
      {}
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.location.path).toBe('/api')
  })

  test('should handle merging host object properties', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: { value: 'example.com', port: 8080 },
      },
      {
        host: { port: 9000 },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.host?.port).toBe(9000)
  })

  test('should handle merging authentication object properties', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        authentication: { principal: 'user', password: 'oldpass' },
      },
      {
        authentication: { password: 'newpass' },
      }
    )

    expect(result.scheme).toBe('https')
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication?.principal).toBe('user')
    expect(result.authentication?.password).toBe('newpass')
  })

  test('should remove components when merged with null', () => {
    const result = Uris.merge(
      {
        scheme: 'https',
        host: 'example.com',
        authentication: { principal: 'user' },
        location: { path: '/api' },
      },
      {
        scheme: null,
        authentication: null,
      }
    )

    expect(result.scheme).toBeNull()
    expect(result.host?.value).toBe('example.com')
    expect(result.authentication).toBeNull()
    expect(result.location.path).toBe('/api')
  })
})
