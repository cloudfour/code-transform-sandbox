import { MinifyOptions } from 'terser'
import { TransformResult } from '../../transformer'
import { minify } from 'terser/main'

importScripts('https://unpkg.com/comlink/dist/umd/comlink.js')

export interface TerserWorker {
  transform: (input: string, options: MinifyOptions) => Promise<TransformResult>
}

const terserWorker: TerserWorker = {
  transform: async (input, options) => {
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

Comlink.expose(terserWorker)
