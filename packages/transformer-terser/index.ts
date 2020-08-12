import { minify, MinifyOptions } from 'terser/main'

export const adapter: Adapter<MinifyOptions> = {
  name: 'Terser',
  version: '5.0.0',
  async transform(input, options) {
    try {
      const result = await minify(input, options)
      return { code: result.code as string }
    } catch (error) {
      if (error.line !== undefined && error.col !== undefined) {
        return {
          error: {
            message: error.message,
            line: error.line,
            column: error.col,
          },
        }
      }
      return { error }
    }
  },
}
