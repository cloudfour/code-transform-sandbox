import { Transformer } from '../../transformer'
import { TransformOptions } from '@calebeby/esbuild-wasm'

export const transformer: Transformer<TransformOptions> = {
  name: 'esbuild',
  version: '0.6.27',
  defaultOptions: {
    target: 'es2015',
    loader: 'tsx',
    minify: true,
    jsxFragment: 'Fragment',
    jsxFactory: 'h',
  },
  getTransformer: () =>
    import('/transformer-esbuild.js').then((m) => m.transform),
}
