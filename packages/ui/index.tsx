import { h, render } from 'preact'
import { css } from 'linaria'
import './global-styles.css'
import { CodeBox } from './code-box'
import { colors, textFonts } from './colors'
import { useEffect, useState } from 'preact/hooks'
import { adapter } from 'transformer-terser'

const root = document.querySelector('.root')

const appStyles = css`
  background: ${colors.bg};
  color: ${colors.fg};
  font-family: ${textFonts};
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: grid;
  grid-template-rows: 1fr 15rem;
  gap: 2rem;
  padding: 2rem;
`

const codeViewerStyle = css`
  display: flex;
  flex-direction: row;
  gap: 3rem;

  & * {
    flex-grow: 1;
  }
`

const initialCode = `// enter your code here

import { h, render } from 'preact'

render(foo, document.body)
`

const App = () => {
  const [inputCode, setInputCode] = useState(initialCode)
  const [outputCode, setOutputCode] = useState('')

  useEffect(() => {
    setOutputCode('')
    adapter
      .transform(inputCode, { compress: { passes: 500 } })
      .then((result) => {
        if ('error' in result) {
          console.log(result.error)
        } else {
          setOutputCode(result.code)
        }
      })
  }, [inputCode])

  return (
    <div class={appStyles}>
      <div class={codeViewerStyle}>
        <CodeBox title="Input" code={initialCode} onChange={setInputCode} />
        <CodeBox title="Output" code={outputCode} disabled />
      </div>
      <Timeline />
    </div>
  )
}

const Timeline = () => {
  return <div>Timeline</div>
}

if (root) render(<App />, root)
