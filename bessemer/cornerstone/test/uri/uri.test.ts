import { Uris } from '@bessemer/cornerstone'

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
    console.log(Uris.fromString('https://[2001:db8::1]/path'))

    expect(Uris.fromString('https://[2001:db8::1]/path')).toEqual(
      Uris.from({
        scheme: 'https',
        host: { value: '[2001:db8::1]' },
        location: { path: '/path' },
      })
    )
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

  test('should throw error for extremely malformed URI structures', () => {
    expect(() => Uris.fromString('::://@@@:::')).toThrow()
  })

  test('should throw error for authentication section with multiple consecutive colons', () => {
    console.log(Uris.fromString('https://user::pass@example.com'))

    expect(() => Uris.fromString('https://user::pass@example.com')).toThrow()
  })

  test('should throw error for invalid characters in scheme', () => {
    // JOHN need to clean this up after errors look good
    console.log("Uris.parseString('ht@tp://example.com')\n", JSON.stringify(Uris.parseString('ht@tp://example.com').value, null, 2))
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
