import { Results } from '@bessemer/cornerstone'
import { ZotchPlugin } from '@bessemer/zotch'

export const headerPlugin = (key: string, value: string): ZotchPlugin => {
  return {
    processRequest: async ({ request }) => {
      return Results.success({
        ...request,
        headers: {
          ...request.headers,
          [key]: value,
        },
      })
    },
  }
}
