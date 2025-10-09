import { Uris } from '@bessemer/cornerstone'

test('Uris.fromString', () => {
  expect(Uris.fromString('tel:+1-816-555-1212')).toEqual(
    Uris.from({
      scheme: 'tel',
      location: {
        path: '+1-816-555-1212',
      },
    })
  )

  expect(Uris.fromString('tel:+1-816-555-1212?#')).toEqual(
    Uris.from({
      scheme: 'tel',
      location: '+1-816-555-1212',
    })
  )

  expect(Uris.fromString('tel:+1-816-555-1212?#fragment')).toEqual(
    Uris.from({
      scheme: 'tel',
      location: {
        path: '+1-816-555-1212',
        fragment: 'fragment',
      },
    })
  )

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

  expect(Uris.fromString('telnet://192.0.2.16:80')).toEqual(
    Uris.from({
      scheme: 'telnet',
      host: '192.0.2.16:80',
    })
  )

  expect(Uris.fromString('urn:oasis:names:specification:docbook:dtd:xml:4.1.2')).toEqual(
    Uris.from({
      scheme: 'urn',
      location: 'oasis:names:specification:docbook:dtd:xml:4.1.2',
    })
  )

  expect(Uris.fromString('news:comp.infosystems.www.servers.unix')).toEqual(
    Uris.from({
      scheme: 'news',
      location: {
        path: 'comp.infosystems.www.servers.unix',
      },
    })
  )

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
