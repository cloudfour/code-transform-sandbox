import { Transformer } from '../../transformer'

import { transformer as transformerTerser } from 'transformer-terser'
import { transformer as transformerSucrase } from 'transformer-sucrase'
import { transformer as transformerEsbuild } from 'transformer-esbuild'

export const allTransformers: Transformer<any>[] = [
  transformerTerser,
  transformerSucrase,
  transformerEsbuild,
]
