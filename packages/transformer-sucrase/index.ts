import { Options } from 'sucrase'
import { Transformer } from '../../transformer'
import * as Comlink from 'comlink'
import { SucraseWorker } from './transform'

export const transformer: Transformer<Options> = {
  name: 'Sucrase',
  version: '3.15.0',
  defaultOptions: {
    transforms: ['typescript', 'jsx'],
    production: true,
    jsxPragma: 'h',
    jsxFragmentPragma: 'Fragment',
  },
  getTransformer: () => {
    const worker = Comlink.wrap<SucraseWorker>(
      new Worker('/transformer-sucrase.js'),
    )
    return (code, opts) => worker.transform(code, opts)
  },
}
