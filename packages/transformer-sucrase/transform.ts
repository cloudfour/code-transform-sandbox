import { TransformResult } from '../../transformer'
import { transform, Options } from 'sucrase'

importScripts('https://unpkg.com/comlink/dist/umd/comlink.js')

export interface SucraseWorker {
  transform: (input: string, options: Options) => Promise<TransformResult>
}

const sucraseWorker: SucraseWorker = {
  // eslint-disable-next-line caleb/@typescript-eslint/require-await
  transform: async (input, options) => {
    try {
      const result = transform(input, options)
      return { code: result.code }
    } catch (error) {
      if (error.loc && error.message) {
        return {
          error: {
            message: error.message.replace(/\s*\(\d*:\d*\)$/, ''),
            line: error.loc.line,
            // For some reason sucrase columns are always off by one
            column: error.loc.column - 1,
          },
        }
      }
      return { error }
    }
  },
}

Comlink.expose(sucraseWorker)
