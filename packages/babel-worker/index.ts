import '@babel/standalone'
import { TransformOptions, BabelFileResult } from '@babel/core'

declare global {
  interface Babel {
    transform: typeof import('@babel/core').transform
  }
  const Babel: Babel
}

self.addEventListener('message', (e: MessageEvent) => {
  const { input, opts } = e.data as { input: string; opts: TransformOptions }

  let error: Error | undefined
  let result: BabelFileResult | undefined

  try {
    result = Babel.transform(input, opts) || undefined
  } catch (error_) {
    error = error_
  }
  self.postMessage({ ...result, error })
})
