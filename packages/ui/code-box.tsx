import { h } from 'preact'
import { css } from 'linaria'
import { codeFonts, colors } from './colors'

const codeBoxStyle = css`
  box-shadow: 2px 2px 19px 2px black;
  border-radius: 0.5rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
`

const textareaStyle = css`
  background: ${colors.bg};
  color: ${colors.fg};
  font-family: ${codeFonts};
  border: none;
  padding: 2rem;
  resize: none;
  outline: none;
`

interface Props {
  title: string
  code: string
  onChange?: (code: string) => void
  disabled?: boolean
}

const titleStyle = css`
  padding: 0.7rem 1rem;
  background: ${colors.bg1};
`

export const CodeBox = ({ code, onChange, title, disabled = false }: Props) => {
  return (
    <div class={codeBoxStyle}>
      <div class={titleStyle}>{title}</div>
      <textarea
        class={textareaStyle}
        spellcheck={false}
        disabled={disabled}
        onInput={(e) => {
          onChange?.(e.currentTarget.value)
        }}
      >
        {code}
      </textarea>
    </div>
  )
}
