import Zod, { ZodNumber, ZodString } from 'zod'
import { Zotch } from '@bessemer/zotch'
import { expectTypeOf } from 'expect-type'

const userSchema = Zod.object({
  id: Zod.number(),
  name: Zod.string(),
})

describe('Zotch.api', () => {
  test('should throw on duplicate path', () => {
    expect(() =>
      Zotch.api({
        getUsers: {
          method: 'get',
          path: '/users',
          description: 'Get all users',
          response: Zod.array(userSchema),
        },
        getUsers2: {
          method: 'get',
          path: '/users',
          description: 'Get all users',
          response: Zod.array(userSchema),
        },
      })
    ).toThrowError()
  })

  test('should build with parameters (Path,Query,Body,Header)', () => {
    // get users api with query filter for user name, and path parameter for user id and header parameter for user token
    const optionalTrueSchema = Zod.boolean().default(true).optional()
    const partialUserSchema = userSchema.partial()
    const bearerSchema = Zod.string().transform((s) => `Bearer ${s}`)
    const api = Zotch.api({
      createUser: {
        method: 'post',
        path: '/users/:id',
        description: 'Create a user',
        body: partialUserSchema,
        params: {
          id: Zod.number(),
        },
        queries: {
          homonyms: optionalTrueSchema,
          email: optionalTrueSchema,
        },
        headers: {
          ['Authorization']: bearerSchema,
          ['x-custom-header']: Zod.string(),
        },
        response: userSchema,
      },
    })

    expectTypeOf(api).toEqualTypeOf<{
      createUser: {
        method: 'post'
        path: '/users/:id'
        description: 'Create a user'
        body: typeof partialUserSchema
        params: {
          id: ZodNumber
        }
        queries: {
          homonyms: typeof optionalTrueSchema
          email: typeof optionalTrueSchema
        }
        headers: {
          ['Authorization']: typeof bearerSchema
          ['x-custom-header']: ZodString
        }
        response: typeof userSchema
      }
    }>()
  })
})
