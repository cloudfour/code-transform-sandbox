import {
  startService,
  TransformOptions,
  TransformResult as EsbuildResult,
} from '@calebeby/esbuild-wasm'
import { TransformFunction } from '../../transformer'
import esbuildWasmUrl from '@calebeby/esbuild-wasm/esbuild.wasm'

const esbuild = startService({ wasmURL: esbuildWasmUrl })
export const transform: TransformFunction<TransformOptions> = async (
  input,
  options,
) => {
  let res: EsbuildResult
  try {
    res = await (await esbuild).transform(input, options)
  } catch (error) {
    if (error.errors) {
      const err = error.errors[0]
      if (err.location)
        return {
          error: {
            message: err.text,
            line: err.location.line,
            column: err.location.column,
          },
        }
    }
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
