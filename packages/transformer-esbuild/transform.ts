import {
  startService,
  TransformOptions,
  TransformResult as EsbuildResult,
} from 'esbuild-wasm'
import { TransformFunction } from '../../transformer'
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm'

const esbuild = startService({ wasmURL: esbuildWasmUrl })
export const transform: TransformFunction<TransformOptions> = async (
  input,
  options,
) => {
  let res: EsbuildResult
  try {
    res = await (await esbuild).transform(input, options)
  } catch (error) {
    // TODO: error.errors has location info, use it
    return { error }
  }
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
