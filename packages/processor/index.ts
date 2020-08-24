import mitt, { Emitter, EventMap as MittEventMap } from 'mitt'
import { ParsedError, Transformer } from '../../transformer'

interface TransformerWithOptions<Options = {}> {
  transformer: Transformer<Options>
  options: Options
}

interface Processor {
  transformers: readonly Readonly<TransformerWithOptions>[]
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

const runTransformer = async <Options extends {}>(
  transformer: Transformer<Options>,
  code: string,
  options: Options,
) => {
  let t = transformer.cachedTransformer
  if (!t) {
    t = await transformer.getTransformer()
    transformer.cachedTransformer = t
  }
  return t(code, options)
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
      const result = await runTransformer(transformer, code, options)
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
