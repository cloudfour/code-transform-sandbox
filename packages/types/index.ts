export interface TransformResult {
  code: string
  error?: Error
}

export interface Transformer<Opts extends {}> {
  transform(input: string, opts: Opts): Promise<TransformResult>
}
