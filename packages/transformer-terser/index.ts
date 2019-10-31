import { Transformer } from '../types'

interface TerserOpts {}

export const transformer: Transformer<TerserOpts> = {
  transform: async (input, opts) => {
    // const result = Terser.minify(input)
    const result = {} as any
    return {
      code: result.code || '',
      error: result.error,
    }
  },
}
