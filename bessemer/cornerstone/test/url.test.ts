import { Urls } from '@bessemer/cornerstone'

test('Urls.fromString', () => {
  {
    expect(Urls.fromString('https://www.google.com')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  }
  {
    expect(Urls.fromString('https://www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  }

  // JOHN i think we should try and support these URLs without having to have the double slash
  {
    expect(Urls.fromString('//www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.fromString('//www.google.com/')).toEqual(
      Urls.from({
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.fromString('http://localhost:8080')).toEqual(
      Urls.from({
        scheme: 'http',
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }

  {
    expect(Urls.fromString('http://localhost:8080/')).toEqual(
      Urls.from({
        scheme: 'http',
        host: 'localhost:8080',
      })
    )
  }
  {
    expect(Urls.fromString('//localhost:8080')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }
  {
    expect(Urls.fromString('//localhost:8080/')).toEqual(
      Urls.from({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }

  {
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
  }

  {
    expect(Urls.fromString('https://john.lutteringer:password123@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer:password123',
      })
    )
  }

  {
    expect(Urls.fromString('https://john.lutteringer@www.google.com/')).toEqual(
      Urls.from({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer',
      })
    )
  }

  {
    expect(Urls.fromString('john.lutteringer@www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
        },
      })
    )
  }

  {
    expect(Urls.fromString('//john.lutteringer:password123@www.google.com')).toEqual(
      Urls.from({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
          password: 'password123',
        },
      })
    )
  }

  {
    expect(Urls.fromString('//www.google.com?q=Search%20Query')).toEqual(
      Urls.from({
        host: 'www.google.com',
        location: {
          path: '',
          parameters: {
            q: 'Search Query',
          },
        },
      })
    )
  }

  {
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
  }

  {
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
  }
})
