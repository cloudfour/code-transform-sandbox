export interface ParsedError {
  message: string
  line: number
  column: number
}

export type TransformResult = { code: string } | { error: ParsedError | Error }

export type TransformFunction<Options> = (
  input: string,
  options: Options,
) => Promise<TransformResult>

export interface Transformer<Options extends {}> {
  name: string
  version: string
  getTransformer: () =>
    | TransformFunction<Options>
    | Promise<TransformFunction<Options>>
  defaultOptions: Options
  cachedTransformer?: TransformFunction<Options>
}
