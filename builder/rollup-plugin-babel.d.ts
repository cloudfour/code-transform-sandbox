declare module 'rollup-plugin-babel' {
  import { Plugin } from 'rollup'
  import { TransformOptions } from '@babel/core'
  type BabelOpts = TransformOptions & {
    externalHelpers?: boolean
    include?: string | string[]
    exclude?: string | string[]
    externalHelpersWhitelist?: string[]
    extensions?: string[]
  }
  const babel: (opts?: BabelOpts) => Plugin
  export default babel
}
