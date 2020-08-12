interface ParsedError {
  message: string
  line: number
  column: number
}

type TransformResult = { code: string } | { error: ParsedError | Error }

interface Adapter<Options = {}> {
  name: string
  version: string
  transform: (input: string, options: Options) => Promise<TransformResult>
}
