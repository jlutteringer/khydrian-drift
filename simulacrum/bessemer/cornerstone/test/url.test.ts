import { Urls } from '@bessemer/cornerstone'

test('Urls.parse / Urls.build', () => {
  {
    expect(Urls.parse('https://www.google.com')).toEqual(
      Urls.build({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.parse('https://www.google.com/')).toEqual(
      Urls.build({
        scheme: 'https',
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.parse('www.google.com')).toEqual(
      Urls.build({
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.parse('www.google.com/')).toEqual(
      Urls.build({
        host: 'www.google.com',
      })
    )
  }

  {
    expect(Urls.parse('http://localhost:8080')).toEqual(
      Urls.build({
        scheme: 'http',
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }

  {
    expect(Urls.parse('http://localhost:8080/')).toEqual(
      Urls.build({
        scheme: 'http',
        host: 'localhost:8080',
      })
    )
  }

  {
    expect(Urls.parse('localhost:8080')).toEqual(
      Urls.build({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }

  {
    expect(Urls.parse('localhost:8080/')).toEqual(
      Urls.build({
        host: {
          value: 'localhost',
          port: 8080,
        },
      })
    )
  }

  {
    expect(Urls.parse('https://john.lutteringer:password123@www.google.com')).toEqual(
      Urls.build({
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
    expect(Urls.parse('https://john.lutteringer:password123@www.google.com/')).toEqual(
      Urls.build({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer:password123',
      })
    )
  }

  {
    expect(Urls.parse('https://john.lutteringer@www.google.com/')).toEqual(
      Urls.build({
        scheme: 'https',
        host: 'www.google.com',
        authentication: 'john.lutteringer',
      })
    )
  }

  {
    expect(Urls.parse('john.lutteringer@www.google.com')).toEqual(
      Urls.build({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
        },
      })
    )
  }

  {
    expect(Urls.parse('john.lutteringer:password123@www.google.com')).toEqual(
      Urls.build({
        host: 'www.google.com',
        authentication: {
          principal: 'john.lutteringer',
          password: 'password123',
        },
      })
    )
  }

  {
    expect(Urls.parse('www.google.com?q=Search%20Query')).toEqual(
      Urls.build({
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

  // {
  //   expect(Urls.parse('/search?q=Search%20Query')).toEqual(
  //     Urls.build({
  //       location: {
  //         path: '/search',
  //         parameters: {
  //           q: 'search',
  //         },
  //       },
  //     })
  //   )
  // }
})
