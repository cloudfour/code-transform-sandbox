declare module 'linaria/rollup.js' {
  import { Plugin } from 'rollup'
  interface Options {
    sourceMap?: boolean
  }
  const plugin: (opts: Options) => Plugin
  export default plugin
}

declare module 'rollup-plugin-css-only' {
  import { Plugin } from 'rollup'
  interface Options {
    output: string
  }
  const plugin: (opts: Options) => Plugin
  export default plugin
}

declare module 'mri' {
  type Args = string[]
  interface Opts {
    alias?: Record<string, string | string[]>
    boolean?: string | string[]
    string?: string | string[]
    default?: Record<string, string | number | boolean>
  }
  function mri(
    args?: Args,
    opts?: Opts,
  ): { _: string[]; [key: string]: string | number | boolean }
  export default mri
}

declare module 'terser/main' {
  export * from 'terser'
}
