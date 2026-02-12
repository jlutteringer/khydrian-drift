import express from 'express'
import { AddressInfo } from 'net'
import Zod from 'zod'
import multer from 'multer'
import { Zotch } from '@bessemer/zotch'
import { Results } from '@bessemer/cornerstone'
import { ZotchErrorType } from '@bessemer/zotch/zotch-error'

describe('Zotch.client', () => {
  globalThis.FormData = require('form-data')
  const multipart = multer({ storage: multer.memoryStorage() })

  let app: express.Express
  let server: ReturnType<typeof app.listen>
  let port: number

  beforeAll(async () => {
    app = express()
    app.use(express.json())
    app.get('/token', (req, res) => {
      res.status(200).json({ token: req.headers.authorization })
    })
    app.post('/token', (req, res) => {
      res.status(200).json({ token: req.headers.authorization })
    })
    app.get('/error401', (req, res) => {
      res.status(401).json({})
    })
    app.get('/error//error401', (req, res) => {
      res.status(401).json({})
    })
    app.get('/error/:id/error401', (req, res) => {
      res.status(401).json({})
    })
    app.get('/error502', (req, res) => {
      res.status(502).json({ error: { message: 'bad gateway' } })
    })
    app.get('/queries', (req, res) => {
      res.status(200).json({
        queries: req.query.id,
      })
    })
    app.get('/:id', (req, res) => {
      res.status(200).json({ id: Number(req.params.id), name: 'test' })
    })
    app.get('/path/:uuid', (req, res) => {
      res.status(200).json({ uuid: req.params.uuid })
    })
    app.get('/:id/address/:address', (req, res) => {
      res.status(200).json({ id: Number(req.params.id), address: req.params.address })
    })
    app.post('/', (req, res) => {
      res.status(200).json({ id: 3, name: req.body.name })
    })
    app.put('/', (req, res) => {
      res.status(200).json({ id: req.body.id, name: req.body.name })
    })
    app.patch('/', (req, res) => {
      res.status(200).json({ id: req.body.id, name: req.body.name })
    })
    app.delete('/:id', (req, res) => {
      res.status(200).json({ id: Number(req.params.id) })
    })
    app.post('/form-data', multipart.none() as any, (req, res) => {
      res.status(200).json(req.body)
    })
    app.post('/form-url', express.urlencoded({ extended: false }), (req, res) => {
      res.status(200).json(req.body)
    })
    app.post('/text', express.text(), (req, res) => {
      res.status(200).send(req.body)
    })
    server = app.listen(0)
    port = (server.address() as AddressInfo).port
  })

  afterAll(() => {
    server.close()
  })

  test('should create a new instance of Zotch', () => {
    const zotch = Zotch.client([])
    expect(zotch).toBeDefined()
  })

  test('should create a new instance when providing an api', () => {
    const zotch = Zotch.client([
      {
        alias: 'getThingById',
        method: 'get',
        path: '/:id',
        response: Zod.object({
          id: Zod.number(),
          name: Zod.string(),
        }),
      },
    ])
    expect(zotch).toBeDefined()
  })

  test('should should throw with duplicate api endpoints', () => {
    expect(() =>
      Zotch.client([
        {
          alias: 'getThingById',
          method: 'get',
          path: '/:id',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
        {
          alias: 'getThingById',
          method: 'get',
          path: '/:id',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ])
    ).toThrowError("Zotch: Duplicate path 'get /:id'")
  })

  test('should create a new instance whithout base URL', () => {
    const zotch = Zotch.client([
      {
        alias: 'getThingById',
        method: 'get',
        path: '/:id',
        response: Zod.object({
          id: Zod.number(),
          name: Zod.string(),
        }),
      },
    ])
    expect(zotch).toBeDefined()
  })

  // test('should register have validation plugin automatically installed', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(1)
  // })

  // test('should register a plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   zotch.use({
  //     request: async (_, config) => config,
  //   })
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(2)
  // })
  //
  // test('should unregister a plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   const id = zotch.use({
  //     request: async (_, config) => config,
  //   })
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(2)
  //   zotch.eject(id)
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(1)
  // })
  //
  // test('should replace a named plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   const plugin: ZotchPlugin = {
  //     name: 'test',
  //     request: async (_, config) => config,
  //   }
  //   zotch.use(plugin)
  //   zotch.use(plugin)
  //   zotch.use(plugin)
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(2)
  // })
  //
  // test('should unregister a named plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   const plugin: ZotchPlugin = {
  //     name: 'test',
  //     request: async (_, config) => config,
  //   }
  //   zotch.use(plugin)
  //   zotch.eject('test')
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('any-any').count()).toBe(1)
  // })
  //
  // test('should throw if invalid parameters when registering a plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [])
  //   // @ts-ignore
  //   expect(() => zotch.use(0)).toThrowError('Zotch: invalid plugin')
  // })
  //
  // test('should throw if invalid alias when registering a plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/:id',
  //       alias: 'test',
  //       response: Zod.object({
  //         id: Zod.number(),
  //         name: Zod.string(),
  //       }),
  //     },
  //   ])
  //   expect(() =>
  //     // @ts-ignore
  //     zotch.use('tests', {
  //       // @ts-ignore
  //       request: async (_, config) => config,
  //     })
  //   ).toThrowError("Zotch: no alias 'tests' found to register plugin")
  // })
  //
  // test('should throw if invalid endpoint when registering a plugin', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/:id',
  //       response: Zod.object({
  //         id: Zod.number(),
  //         name: Zod.string(),
  //       }),
  //     },
  //   ])
  //   expect(() =>
  //     // @ts-ignore
  //     zotch.use('get', '/test/:id', {
  //       // @ts-ignore
  //       request: async (_, config) => config,
  //     })
  //   ).toThrowError("Zotch: no endpoint 'get /test/:id' found to register plugin")
  // })
  //
  // test('should register a plugin by endpoint', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/:id',
  //       response: Zod.object({
  //         id: Zod.number(),
  //         name: Zod.string(),
  //       }),
  //     },
  //   ])
  //   zotch.use('get', '/:id', {
  //     request: async (_, config) => config,
  //   })
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('get-/:id').count()).toBe(1)
  // })
  //
  // test('should register a plugin by alias', () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/:id',
  //       alias: 'test',
  //       response: Zod.object({
  //         id: Zod.number(),
  //         name: Zod.string(),
  //       }),
  //     },
  //   ])
  //   zotch.use('test', {
  //     request: async (_, config) => config,
  //   })
  //   // @ts-ignore
  //   expect(zotch.endpointPlugins.get('get-/:id').count()).toBe(1)
  // })
  //
  // test('should make an http request', async () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/:id',
  //       response: Zod.object({
  //         id: Zod.number(),
  //         name: Zod.string(),
  //       }),
  //     },
  //     {
  //       method: 'get',
  //       path: '/users',
  //       response: Zod.array(
  //         Zod.object({
  //           id: Zod.number(),
  //           name: Zod.string(),
  //         })
  //       ),
  //     },
  //   ])
  //   const response = await zotch.request({
  //     //      ^?
  //     method: 'get',
  //     url: '/:id',
  //     params: { id: 7 },
  //   })
  //
  //   const testResonseType: Assert<typeof response, Result<{ id: number; name: string }, ZotchValidationError>> = true
  //   expect(response).toEqual({ id: 7, name: 'test' })
  // })

  // JOHN
  // test('should make an http get with standard query arrays', async () => {
  //   const zotch = new Zotch(`http://localhost:${port}`, [
  //     {
  //       method: 'get',
  //       path: '/queries',
  //       parameters: [
  //         {
  //           name: 'id',
  //           type: 'Query',
  //           schema: Zod.array(Zod.number()),
  //         },
  //       ],
  //       response: Zod.object({
  //         queries: Zod.array(Zod.string()),
  //       }),
  //     },
  //   ])
  //   const response = await zotch.get('/queries', { queries: { id: [1, 2] } })
  //   expect(response).toEqual({ queries: ['1', '2'] })
  // })

  test('should make an http get with one path params', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'fetchById',
          method: 'get',
          path: '/:id',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.fetchById({ params: { id: 7 } })
    Results.assertSuccess(response)
    expect(response).toEqual({ id: 7, name: 'test' })
  })

  test('should make an http alias request with one path params', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          path: '/:id',
          alias: 'getById',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.getById({ params: { id: 7 } })
    expect(response).toEqual({ id: 7, name: 'test' })
  })

  test('should work with api builder', async () => {
    const api = Zotch.apiBuilder({
      method: 'get',
      path: '/:id',
      alias: 'getById',
      response: Zod.object({
        id: Zod.number(),
        name: Zod.string(),
      }),
    }).build()
    const zotch = Zotch.client(api, { baseUrl: `http://localhost:${port}`, fetch })
    const response = await zotch.getById({ params: { id: 7 } })
    expect(response).toEqual({ id: 7, name: 'test' })
  })

  test('should make a get request with forgotten params and get back a zod error', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'fetchById',
          method: 'get',
          path: '/:id',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    // @ts-ignore
    const response = await zotch.fetchById('/:id')
    Results.assertFailure(response)
    expect(response.value.type).toEqual(ZotchErrorType.RequestInvalid)
  })

  test('should make an http get with multiples path params', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'fetchById',
          method: 'get',
          path: '/:id/address/:address',
          response: Zod.object({
            id: Zod.number(),
            address: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.fetchById({
      params: { id: 7, address: 'address' },
    })
    expect(response).toEqual({ id: 7, address: 'address' })
  })

  test('should make an http post with body param', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'updateById',
          method: 'post',
          path: '/',
          parameters: [
            {
              name: 'name',
              type: 'Body',
              schema: Zod.object({
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.updateById({ name: 'post' })
    console.log(response)
    expect(response).toEqual({ id: 3, name: 'post' })
  })

  test('should make an http post with transformed body param', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'updateById',
          method: 'post',
          path: '/',
          parameters: [
            {
              name: 'name',
              type: 'Body',
              schema: Zod.object({
                firstname: Zod.string(),
                lastname: Zod.string(),
              }).transform((data) => ({
                name: `${data.firstname} ${data.lastname}`,
              })),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.updateById({ firstname: 'post', lastname: 'test' })
    expect(response).toEqual({ id: 3, name: 'post test' })
  })

  test('should throw a zotch error if params are not correct', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'updateById',
          method: 'post',
          path: '/',
          parameters: [
            {
              name: 'name',
              type: 'Body',
              schema: Zod.object({
                email: Zod.email(),
              }).transform((data) => ({
                name: `${data.email.split('@')[0]}`,
              })),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.updateById({
      email: 'post',
    })
    Results.assertFailure(response)
    expect(response.value.type).toEqual(ZotchErrorType.RequestInvalid)
  })

  test('should make an http mutation alias request with body param', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'post',
          path: '/',
          alias: 'create',
          parameters: [
            {
              name: 'name',
              type: 'Body',
              schema: Zod.object({
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { fetch }
    )

    const response = await zotch.create({ name: 'post' }, { baseUrl: `http://localhost:${port}` })
    expect(response).toEqual({ id: 3, name: 'post' })
  })

  test('should make an http put', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'putThat',
          method: 'put',
          path: '/',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { fetch }
    )
    const response = await zotch.putThat({ id: 5, name: 'put' }, { baseUrl: `http://localhost:${port}` })
    expect(response).toEqual({ id: 5, name: 'put' })
  })

  test('should make an http put alias', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'put',
          path: '/',
          alias: 'update',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { fetch }
    )
    const response = await zotch.update({ id: 5, name: 'put' }, { baseUrl: `http://localhost:${port}` })
    expect(response).toEqual({ id: 5, name: 'put' })
  })

  test('should make an http patch', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'patchThat',
          method: 'patch',
          path: '/',
          parameters: [
            {
              name: 'id',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.patchThat({ id: 4, name: 'patch' })
    console.log('Patch response:', response)
    expect(response).toEqual({ id: 4, name: 'patch' })
  })

  test('should make an http patch alias', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'patch',
          path: '/',
          alias: 'update',
          parameters: [
            {
              name: 'id',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.update({ id: 4, name: 'patch' })
    expect(response).toEqual({ id: 4, name: 'patch' })
  })

  test('should make an http delete', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'deleteById',
          method: 'delete',
          path: '/:id',
          response: Zod.object({
            id: Zod.number(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.deleteById(undefined, {
      params: { id: 6 },
    })
    expect(response).toEqual({ id: 6 })
  })

  test('should make an http delete alias', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'delete',
          path: '/:id',
          alias: 'remove',
          response: Zod.object({
            id: Zod.number(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.remove(undefined, {
      params: { id: 6 },
    })
    expect(response).toEqual({ id: 6 })
  })

  test('should validate uuid in path params', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'getUuid',
          method: 'get',
          path: '/path/:uuid',
          parameters: [
            {
              name: 'uuid',
              type: 'Path',
              schema: Zod.string().uuid(),
            },
          ],
          response: Zod.object({
            uuid: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.getUuid({
      params: { uuid: 'e9e09a1d-3967-4518-bc89-75a901aee128' },
    })
    expect(response).toEqual({
      uuid: 'e9e09a1d-3967-4518-bc89-75a901aee128',
    })
  })

  test('should not validate bad path params', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'getUuid',
          method: 'get',
          path: '/path/:uuid',
          parameters: [
            {
              name: 'uuid',
              type: 'Path',
              schema: Zod.uuid(),
            },
          ],
          response: Zod.object({
            uuid: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.getUuid({
      params: { uuid: 'e9e09a1-3967-4518-bc89-75a901aee128' },
    })
    Results.assertFailure(response)
    expect(response.value.type).toBe(ZotchErrorType.RequestInvalid)
  })

  // JOHN
  //   test('should not validate bad formatted responses', async () => {
  //     const zotch = new Zotch(`http://localhost:${port}`, [
  //       {
  //         method: 'get',
  //         path: '/:id',
  //         response: Zod.object({
  //           id: Zod.number(),
  //           name: Zod.string(),
  //           more: Zod.string(),
  //         }),
  //       },
  //     ])
  //     try {
  //       await zotch.get('/:id', { params: { id: 1 } })
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(ZotchError)
  //       expect((e as ZotchError).cause).toBeInstanceOf(ZodError)
  //       expect((e as ZotchError).message).toBe(`Zotch: Invalid response from endpoint 'get /:id'
  // status: 200 OK
  // cause:
  // [
  //   {
  //     "code": "invalid_type",
  //     "expected": "string",
  //     "received": "undefined",
  //     "path": [
  //       "more"
  //     ],
  //     "message": "Required"
  //   }
  // ]
  // received:
  // {
  //   "id": 1,
  //   "name": "test"
  // }`)
  //       expect((e as ZotchError).data).toEqual({
  //         id: 1,
  //         name: 'test',
  //       })
  //       expect((e as ZotchError).config).toEqual({
  //         method: 'get',
  //         url: '/:id',
  //         params: { id: 1 },
  //       })
  //     }
  //   })

  test('should match Expected error', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          alias: 'getError502',
          path: '/error502',
          response: Zod.void(),
          errors: [
            {
              status: 502,
              schema: Zod.object({
                error: Zod.object({
                  message: Zod.string(),
                }),
              }),
            },
            {
              status: 401,
              schema: Zod.object({
                error: Zod.object({
                  message: Zod.string(),
                }),
              }),
            },
            {
              status: 500,
              schema: Zod.object({
                error: Zod.object({
                  message: Zod.string(),
                }),
              }),
            },
          ],
        },
        {
          method: 'get',
          alias: 'getErrorById',
          path: '/error502/:id',
          response: Zod.void(),
          errors: [
            {
              status: 502,
              schema: Zod.object({
                error: Zod.object({
                  message: Zod.string(),
                }),
              }),
            },
            {
              status: 401,
              schema: Zod.object({
                error: Zod.object({
                  message: Zod.string(),
                }),
              }),
            },
          ],
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.getError502()
    Results.assertFailure(response)
    console.log(response)
    Zotch.assertStructuredError(response.value)
    expect(response.value.status).toBe(502)
  })

  test('should match error with params', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          alias: 'getError401',
          path: '/error/:id/error401',
          response: Zod.void(),
          errors: [
            {
              status: 401,
              schema: Zod.object({}),
            },
          ],
        },
        {
          method: 'get',
          alias: 'getError404',
          path: '/error/:id/error404',
          response: Zod.void(),
          errors: [
            {
              status: 404,
              schema: Zod.object({}),
            },
          ],
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const params = {
      id: 'test',
    }

    const response = await zotch.getError401({ params })
    Results.assertFailure(response)
    Zotch.assertStructuredError(response.value)
    expect(response.value.status).toBe(401)
  })

  test('should match error with empty params', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          alias: 'getError401',
          path: '/error/:id/error401',
          response: Zod.void(),
          errors: [
            {
              status: 401,
              schema: Zod.object({}),
            },
          ],
        },
        {
          method: 'get',
          alias: 'getError404',
          path: '/error/:id/error404',
          response: Zod.void(),
          errors: [
            {
              status: 404,
              schema: Zod.object({}),
            },
          ],
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const params = {
      id: '',
    }

    const response = await zotch.getError401({ params })
    Results.assertFailure(response)
    Zotch.assertStructuredError(response.value)
    expect(response.value.status).toBe(401)
  })

  test('should match error with optional params at the end', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          alias: 'getError401',
          path: '/error/:id/error401/:message',
          response: Zod.void(),
          errors: [
            {
              status: 401,
              schema: Zod.object({}),
            },
          ],
        },
        {
          method: 'get',
          alias: 'getError404',
          path: '/error/:id/error404/:message',
          response: Zod.void(),
          errors: [
            {
              status: 404,
              schema: Zod.object({}),
            },
          ],
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const params = {
      id: 'test',
      message: '',
    }

    const response = await zotch.getError401({ params })
    Results.assertFailure(response)
    Zotch.assertStructuredError(response.value)
    expect(response.value.status).toBe(401)
  })

  test('should match Unexpected error', async () => {
    const zotch = Zotch.client(
      [
        {
          method: 'get',
          alias: 'getError502',
          path: '/error502',
          response: Zod.void(),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.getError502()
    Results.assertFailure(response)
    // JOHN inspect value
  })

  test('should trigger an axios error with error response', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'error502',
          method: 'get',
          path: '/error502',
          response: Zod.object({
            id: Zod.number(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.error502()
    Results.assertFailure(response)
    // JOHN inspect value
  })

  test('should send a form data request', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'formData',
          method: 'post',
          path: '/form-data',
          requestFormat: 'form-data',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.string(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.formData({ id: 4, name: 'post' })
    expect(response).toEqual({ id: '4', name: 'post' })
  })

  test('should send a form data request a second time under 100 ms', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'formData',
          method: 'post',
          path: '/form-data',
          requestFormat: 'form-data',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.string(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.formData({ id: 4, name: 'post' })
    expect(response).toEqual({ id: '4', name: 'post' })
  }, 100)

  test('should not send an array as form data request', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'formData',
          method: 'post',
          path: '/form-data',
          requestFormat: 'form-data',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.array(Zod.string()),
            },
          ],
          response: Zod.string(),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.formData(['test', 'test2'])
    Results.assertFailure(response)
    expect(response.value.type).toBe(ZotchErrorType.RequestInvalid)
  })

  test('should send a form url request', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'formUrl',
          method: 'post',
          path: '/form-url',
          requestFormat: 'form-url',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.object({
                id: Zod.number(),
                name: Zod.string(),
              }),
            },
          ],
          response: Zod.object({
            id: Zod.string(),
            name: Zod.string(),
          }),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.formUrl({ id: 4, name: 'post' })
    Results.assertSuccess(response)
    expect(response).toEqual({ id: '4', name: 'post' })
  })

  test('should not send an array as form url request', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'formUrl',
          method: 'post',
          path: '/form-url',
          requestFormat: 'form-url',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.array(Zod.string()),
            },
          ],
          response: Zod.string(),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )

    const response = await zotch.formUrl(['test', 'test2'])
    Results.assertFailure(response)
    expect(response.value.type).toBe(ZotchErrorType.RequestInvalid)
  })

  test('should send a text request', async () => {
    const zotch = Zotch.client(
      [
        {
          alias: 'postText',
          method: 'post',
          path: '/text',
          requestFormat: 'text',
          parameters: [
            {
              name: 'body',
              type: 'Body',
              schema: Zod.string(),
            },
          ],
          response: Zod.string(),
        },
      ],
      { baseUrl: `http://localhost:${port}`, fetch }
    )
    const response = await zotch.postText('test')
    expect(response).toEqual('test')
  })
})
