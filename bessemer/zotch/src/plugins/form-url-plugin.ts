import { Objects, Results } from '@bessemer/cornerstone'
import { ZotchErrorType } from '@bessemer/zotch/zotch-error'
import { ZotchPlugin } from '@bessemer/zotch/plugins/zotch-plugins'

const plugin: ZotchPlugin = {
  name: 'form-url',
  processRequest: async (context) => {
    if (!Objects.isObject(context.request.body)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        ...context,
        message: 'Zotch: application/x-www-form-urlencoded body must be an object',
        value: context.request.body,
      })
    }

    return Results.success({
      ...context.request,
      body: new URLSearchParams(context.request.body as any).toString(),
      headers: {
        ...context.request.headers,
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
export const formUrlPlugin = (): ZotchPlugin => {
  return plugin
}
