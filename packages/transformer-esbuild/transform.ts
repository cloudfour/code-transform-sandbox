import { startService, TransformOptions } from 'esbuild-wasm'
import { TransformFunction } from '../../transformer'

const esbuild = startService({})
export const transform: TransformFunction<TransformOptions> = async (
  input,
  options,
) => {
  const res = await (await esbuild).transform(input, options)
  if (res.warnings.length > 0) {
    const error = res.warnings[0]
    if (error.location)
      return {
        error: {
          message: error.text,
          line: error.location.line,
          column: error.location.column,
        },
      }
    return { error: new Error(error.text) }
  }
  return { code: res.js }
}
