import { render, h, Fragment } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Transformer, TransformResult } from '../types'

const babelOpts = {}
const terserOpts = {}

const useAsyncTransformer = <T extends {}>(transformerPath: string) => {
  const [transformer, setTransformer] = useState<Transformer<T> | undefined>(
    undefined,
  )

  useEffect(() => {
    import(transformerPath).then(mod => setTransformer(mod.transformer))
  }, [transformerPath])

  return transformer && transformer.transform
}

const useTransform = <T extends {}>(
  transformer:
    | undefined
    | ((input: string, opts: T) => Promise<TransformResult>),
  text: string,
  opts: T,
) => {
  const [val, setVal] = useState<TransformResult>({ code: '' })
  useEffect(() => {
    if (transformer) transformer(text, opts).then(setVal)
  }, [opts, text, transformer])
  return val
}

const App = () => {
  const [text, setText] = useState('')

  // const terser = useAsyncTransformer('/dist/terser.js')
  // console.log(terser)

  const babel = useAsyncTransformer('/dist/babel.js')

  const babelResult = useTransform(babel, text, babelOpts)
  // const terserResult = useTransform(terser, text, terserOpts)

  return (
    <Fragment>
      <textarea
        onInput={e => setText((e.target as HTMLTextAreaElement).value)}
      />
      <h1>Hi</h1>
      {/* <pre>{terserResult.code}</pre>
      <pre>{terserResult.error && terserResult.error.message}</pre> */}
      <pre>{babelResult.code}</pre>
      <pre>{babelResult.error && babelResult.error.message}</pre>
    </Fragment>
  )
}

const root = document.querySelector('#root')
if (root) render(<App />, root)
