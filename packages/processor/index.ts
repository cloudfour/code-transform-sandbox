import mitt, { Emitter, EventMap as MittEventMap } from 'mitt'
import { ParsedError, Transformer, TransformFunction } from '../../transformer'

interface TransformerWithOptions<Options = {}> {
  transformer: Transformer<Options>
  options: Options
}

interface Processor {
  readonly transformers: TransformerWithOptions[]
}

type ImmutableProcessor = Readonly<Processor>

export { ImmutableProcessor as Processor }

export const createProcessor = (
  transformers: TransformerWithOptions[] = [],
): ImmutableProcessor => {
  const processor: Processor = {
    transformers,
  }

  return processor
}

interface EventMap extends MittEventMap {
  outputCode: string
  error: ParsedError | Error
}

interface ActiveProcess extends Emitter<EventMap> {
  cancel(): void
}

const loadTransformer = <Options extends {}>(
  transformer: Transformer<Options>,
) => {
  if (transformer.cachedTransformer) {
    return transformer.cachedTransformer
  }
  const transformerFunc = transformer.getTransformer()
  transformer.cachedTransformer = transformerFunc
  return transformerFunc
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
      const { transformer, options } = processor.transformers[i]
      const result = await loadTransformer(transformer)(code, options)
      if (isCancelled) return
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
