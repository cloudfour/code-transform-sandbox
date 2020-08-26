import { Transformer } from '../../transformer'
import { TransformOptions } from '@calebeby/esbuild-wasm'

export const transformer: Transformer<TransformOptions> = {
  name: 'esbuild',
  version: '0.6.27',
  defaultOptions: {},
  getTransformer: () =>
    import('/transformer-esbuild.js').then((m) => m.transform),
}
