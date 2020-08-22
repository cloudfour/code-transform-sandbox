import clsx from 'clsx'
import { css } from 'linaria'
import { h, Ref } from 'preact'

interface Props extends h.JSX.HTMLAttributes {
  href?: string
  as?: keyof h.JSX.IntrinsicElements
  class?: string
  reff?: Ref<HTMLElement>
}

const cardStyle = css`
  box-shadow: 2px 2px 19px 2px black;
  border-radius: 0.5rem;
  overflow: hidden;
`

export const Card = ({ href, as, class: className, reff, ...props }: Props) => {
  const El = as ?? (href ? 'a' : 'div')
  // @ts-expect-error
  return <El class={clsx(cardStyle, className)} {...props} ref={reff} />
}
