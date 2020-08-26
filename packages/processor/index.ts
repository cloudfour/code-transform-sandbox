import mitt, { Emitter, EventMap as MittEventMap } from 'mitt'
import { ParsedError, Transformer, TransformResult } from '../../transformer'
import flru, { flruCache as FlruCache } from 'flru'

export interface TransformerInstance<Options = {}> {
  transformer: Transformer<Options>
  options: Options
  cache: FlruCache<TransformResult>
}

interface Processor {
  transformers: readonly Readonly<TransformerInstance>[]
}

type ImmutableProcessor = Readonly<Processor>

export { ImmutableProcessor as Processor }

export const createProcessor = (
  transformers: TransformerInstance[] = [],
): ImmutableProcessor => {
  const processor: Processor = {
    transformers,
  }

  return processor
}

export const createTransformCache = () => flru<TransformResult>(10)

interface EventMap extends MittEventMap {
  outputCode: string
  error: ParsedError | Error
}

interface ActiveProcess extends Emitter<EventMap> {
  cancel(): void
}

const runTransformer = async <Options extends {}>(
  { transformer, options, cache }: TransformerInstance<Options>,
  code: string,
) => {
  const cached = cache.get(code)
  if (cached) return cached
  let t = transformer.cachedTransformer
  if (!t) {
    t = await transformer.getTransformer()
    transformer.cachedTransformer = t
  }
  const transformResult = await t(code, options)
  cache.set(code, transformResult)
  return transformResult
}

export const process = (
  processor: ImmutableProcessor,
  inputCode: string,
): ActiveProcess => {
  let isCancelled = false
  const cancel = () => {
    isCancelled = true
  }
  const emitter = mitt<EventMap>()

  Promise.resolve().then(async () => {
    let code = inputCode
    for (let i = 0; i < processor.transformers.length; i++) {
      if (isCancelled) return
      const transformerInstance = processor.transformers[i]
      const result = await runTransformer(transformerInstance, code)
      if ('error' in result) {
        emitter.emit('error', result.error)
        return
      }
      code = result.code
    }
    emitter.emit('outputCode', code)
  })

  return {
    ...emitter,
    cancel,
  }
}
