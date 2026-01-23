import { ZodiosValidationError } from '@bessemer/zodios/zodios-error'
import type { ZodiosPlugin } from '@bessemer/zodios/types'
import { Results } from '@bessemer/cornerstone'

const plugin: ZodiosPlugin = {
  name: 'form-data',
  processRequest: async (_, config) => {
    if (typeof config.data !== 'object' || Array.isArray(config.data)) {
      return Results.failure(new ZodiosValidationError('Zodios: multipart/form-data body must be an object', config))
    }

    const data = getFormDataStream(config.data as any)

    return Results.success({
      ...config,
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
export const formDataPlugin = (): ZodiosPlugin => {
  return plugin
}
