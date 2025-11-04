import Zod from 'zod'
import { makeApi, OpenApi } from '@bessemer/zodios'

const user = Zod.object({
  id: Zod.string(),
  name: Zod.string(),
  email: Zod.email(),
})

const api = makeApi([
  {
    method: 'get',
    path: '/users?filter=:filter#fragment',
    alias: 'getUsers',
    description: 'Get all users',
    parameters: [
      {
        name: 'limit',
        type: 'Query',
        description: 'Limit the number of users',
        schema: Zod.number().positive().default(10),
      },
      {
        name: 'offset',
        type: 'Query',
        description: 'Offset the number of users',
        schema: Zod.number().positive().optional(),
      },
      {
        name: 'filter',
        type: 'Query',
        description: 'Filter users by name',
        schema: Zod.array(Zod.string()).refine((a) => new Set(a).size === a.length, 'No duplicates allowed'),
      },
    ],
    response: Zod.array(user),
    errors: [
      {
        status: 404,
        description: 'No users found',
        schema: Zod.object({
          message: Zod.literal('No users found'),
        }),
      },
      {
        status: 'default',
        description: 'Default error',
        schema: Zod.object({
          message: Zod.string(),
        }),
      },
    ],
  },
  {
    method: 'get',
    path: '/users/:id',
    alias: 'getUser',
    description: 'Get a user by id',
    response: user,
  },
  {
    method: 'post',
    path: '/users',
    alias: 'createUser',
    description: 'Create a user',
    parameters: [
      {
        name: 'user',
        type: 'Body',
        description: 'The user to create',
        schema: user.omit({ id: true }),
      },
    ],
    response: user,
  },
  {
    method: 'put',
    path: '/users/:id',
    alias: 'updateUser',
    description: 'Update a user',
    parameters: [
      {
        name: 'user',
        type: 'Body',
        description: 'The user to update',
        schema: user,
      },
    ],
    response: user,
  },
  {
    method: 'delete',
    path: '/users/:id',
    alias: 'deleteUser',
    description: 'Delete a user',
    response: Zod.unknown(),
    status: 204,
  },
])

describe('toOpenApi', () => {
  it('should generate bearer scheme', () => {
    const scheme = OpenApi.bearerAuthScheme()
    expect(scheme).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
  })

  it('should generate basic scheme', () => {
    const scheme = OpenApi.basicAuthScheme()
    expect(scheme).toEqual({
      type: 'http',
      scheme: 'basic',
    })
  })

  it('should generate oauth2 scheme', () => {
    const scheme = OpenApi.oauth2Scheme({
      implicit: {
        authorizationUrl: 'https://example.com/oauth2/authorize',
        scopes: {
          read: 'Read access',
          write: 'Write access',
        },
      },
    })
    expect(scheme).toEqual({
      type: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl: 'https://example.com/oauth2/authorize',
          scopes: {
            read: 'Read access',
            write: 'Write access',
          },
        },
      },
    })
  })

  it('should convert to openapi with builder', () => {
    const openApi = OpenApi.openApiBuilder({
      title: 'My API',
      version: '1.0.0',
    })
      .addPublicApi(api)
      .build()
    expect(openApi).toMatchSnapshot()
  })

  it('should convert to openapi with builder with security', () => {
    const openApi = OpenApi.openApiBuilder({
      title: 'My API',
      version: '1.0.0',
    })
      .addServer({ url: '/api/v1' })
      .addSecurityScheme('auth', OpenApi.bearerAuthScheme())
      .addProtectedApi('auth', api)
      .build()
    expect(openApi).toMatchSnapshot()
  })
})
