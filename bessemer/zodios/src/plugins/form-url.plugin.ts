import { ZodiosValidationError } from '@bessemer/zodios/zodios-error'
import type { ZodiosPlugin } from '@bessemer/zodios/types'
import { Results } from '@bessemer/cornerstone'

const plugin: ZodiosPlugin = {
  name: 'form-url',
  processRequest: async (_, config) => {
    if (typeof config.data !== 'object' || Array.isArray(config.data)) {
      return Results.failure(new ZodiosValidationError('Zodios: application/x-www-form-urlencoded body must be an object', config))
    }

    return Results.success({
      ...config,
      data: new URLSearchParams(config.data as any).toString(),
      headers: {
        ...config.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
}

/**
 * form-url plugin used internally by Zodios.
 * @example
 * ```typescript
 *   const apiClient = new Zodios(
 *     "https://mywebsite.com",
 *     [{
 *       method: "post",
 *       path: "/login",
 *       alias: "login",
 *       description: "Submit a form",
 *       requestFormat: "form-url",
 *       parameters:[
 *         {
 *           name: "body",
 *           type: "Body",
 *           schema: z.object({
 *             userName: z.string(),
 *             password: z.string(),
 *           }),
 *         }
 *       ],
 *       response: z.object({
 *         id: z.number(),
 *       }),
 *     }],
 *   );
 *   const id = await apiClient.login({ userName: "user", password: "password" });
 * ```
 * @returns form-url plugin
 */
export const formURLPlugin = (): ZodiosPlugin => {
  return plugin
}
