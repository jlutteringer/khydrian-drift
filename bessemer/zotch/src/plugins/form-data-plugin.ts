import { Objects, Results } from '@bessemer/cornerstone'
import { ZotchErrorType } from '@bessemer/zotch/zotch-error'
import { ZotchPlugin } from '@bessemer/zotch/plugins/zotch-plugins'

const plugin: ZotchPlugin = {
  name: 'form-data',
  processRequest: async (context) => {
    if (!Objects.isObject(context.request.body)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        ...context,
        message: 'Zotch: multipart/form-data body must be an object',
        value: context.request.body,
      })
    }

    const data = getFormDataStream(context.request.body as any)

    return Results.success({
      ...context.request,
      data,
    })
  },
}

const getFormDataStream = (data: Record<string, string | Blob>): FormData => {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key]!)
  }
  return formData
}

/**
 * form-data plugin used internally by Zodios.
 * @example
 * ```typescript
 *   const apiClient = new Zodios(
 *     "https://mywebsite.com",
 *     [{
 *       method: "post",
 *       path: "/upload",
 *       alias: "upload",
 *       description: "Upload a file",
 *       requestFormat: "form-data",
 *       parameters:[
 *         {
 *           name: "body",
 *           type: "Body",
 *           schema: z.object({
 *             file: z.instanceof(File),
 *           }),
 *         }
 *       ],
 *       response: z.object({
 *         id: z.number(),
 *       }),
 *     }],
 *   );
 *   const id = await apiClient.upload({ file: document.querySelector('#file').files[0] });
 * ```
 * @returns form-data plugin
 */
export const formDataPlugin = (): ZotchPlugin => {
  return plugin
}
