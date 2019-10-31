import { Transformer } from '../types'

interface BabelOpts {}

const worker = new Worker('/dist/babel-worker.js')

export const transformer: Transformer<BabelOpts> = {
  transform: (input, opts) =>
    new Promise(resolve => {
      const listener = (e: MessageEvent) => {
        resolve(e.data)
        worker.removeEventListener('message', listener)
      }
      worker.postMessage({ input, opts })
      worker.addEventListener('message', listener)
    }),
}
