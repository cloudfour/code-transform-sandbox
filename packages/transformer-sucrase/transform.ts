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
      return { error }
    }
  },
}

Comlink.expose(sucraseWorker)
