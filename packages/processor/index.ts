import mitt, { Emitter, EventMap as MittEventMap } from 'mitt'
import { ParsedError, Transformer, TransformResult } from '../../transformer'
import flru, { flruCache as FlruCache } from 'flru'

export interface TransformerInstance<Options = {}> {
  transformer: Transformer<Options>
  options: Options
  cache: FlruCache<TransformResult>
  isEnabled: boolean
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
  error: TransformerError
}

interface ActiveProcess extends Emitter<EventMap> {
  cancel(): void
  getCodeBeforeTransformerIndex: (
    transformerIndex: number,
  ) => string | undefined
}

export interface TransformerError {
  error: ParsedError | Error
  transformerIndex: number
}

const runTransformer = async <Options extends {}>(
  { transformer, options, cache, isEnabled }: TransformerInstance<Options>,
  code: string,
) => {
  if (!isEnabled) return { code }
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

  /**
   * The code used as the input for each transformer.
   * The code at an index is the code passed into that transformer index
   */
  const inputCodes: string[] = [inputCode]

  Promise.resolve().then(async () => {
    let code = inputCode
    for (let i = 0; i < processor.transformers.length; i++) {
      if (isCancelled) return
      const transformerInstance = processor.transformers[i]
      const result = await runTransformer(transformerInstance, code)
      if ('error' in result) {
        emitter.emit('error', { error: result.error, transformerIndex: i })
        return
      }
      code = result.code
      inputCodes[i + 1] = code
    }
    emitter.emit('outputCode', code)
  })

  const getCodeBeforeTransformerIndex = (transformerIndex: number) =>
    inputCodes[transformerIndex]

  return {
    ...emitter,
    cancel,
    getCodeBeforeTransformerIndex,
  }
}
