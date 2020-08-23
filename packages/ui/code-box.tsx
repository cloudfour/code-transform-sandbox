import { h } from 'preact'
import { css } from 'linaria'
import { codeFonts, colors } from './colors'
import { Card } from './card'

const codeBoxStyle = css`
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
  close?: () => void
}

const titleStyle = css`
  padding: 0.7rem 1rem;
  background: ${colors.bg1};
  display: flex;
  justify-content: space-between;
`

export const CodeBox = ({
  code,
  onChange,
  title,
  disabled = false,
  close,
}: Props) => {
  return (
    <Card class={codeBoxStyle}>
      <div class={titleStyle}>
        <span>{title}</span>
        {close && <button onClick={close}>x</button>}
      </div>
      <textarea
        class={textareaStyle}
        spellcheck={false}
        disabled={disabled}
        onKeyDown={(e) => {
          const el = e.currentTarget
          if (e.key === 'Escape') {
            // TODO: handle better
            el.blur()
          } else if (e.key === 'Tab') {
            // Make tab key insert two spaces
            e.preventDefault()
            const start = el.selectionStart
            const end = el.selectionEnd
            // something is selected, ignore
            // TODO: indent selected lines?
            if (start !== end) return
            const tab = '  '
            el.value = el.value.slice(0, start) + tab + el.value.slice(end)

            el.dispatchEvent(new InputEvent('input'))

            el.selectionEnd = end + tab.length
          }
        }}
        onInput={(e) => {
          onChange?.(e.currentTarget.value)
        }}
      >
        {code}
      </textarea>
    </Card>
  )
}
