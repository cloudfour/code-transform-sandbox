import { MinifyOptions } from 'terser/main'
import { Transformer } from '../../transformer'
import * as Comlink from 'comlink'
import { TerserWorker } from './transform'

export const transformer: Transformer<MinifyOptions> = {
  name: 'Terser',
  version: '5.0.0',
  defaultOptions: {
    module: true,
    ecma: 2020,
    compress: {
      passes: 3,
      unsafe: true,
    },
  },
  getTransformer: () => {
    const worker = Comlink.wrap<TerserWorker>(
      new Worker('/transformer-terser.js'),
    )
    return (code, opts) => worker.transform(code, opts)
  },
}
