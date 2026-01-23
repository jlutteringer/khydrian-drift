import type { ZodiosPlugin } from '@bessemer/zodios/types'
import { Results } from '@bessemer/cornerstone'

export const headerPlugin = (key: string, value: string): ZodiosPlugin => {
  return {
    processRequest: async (_, config) => {
      return Results.success({
        ...config,
        headers: {
          ...config.headers,
          [key]: value,
        },
      })
    },
  }
}
