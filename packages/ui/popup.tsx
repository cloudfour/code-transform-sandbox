import { css } from 'linaria'
import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Card } from './card'
import { colors } from './colors'

interface Popup<ResultType = void> {
  targetElement?: HTMLElement
  render: (close: (result: ResultType | undefined) => void) => h.JSX.Element
  onDismiss?: (result: ResultType | undefined) => void
}

const popupsWrapperStyle = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
`

const hiddenWrapperStyle = css`
  background: transparent;
  visibility: hidden;
`

const popupStyle = css`
  background: ${colors.bg1};
`

export const PopupArea = () => {
  const [popups, setPopups] = useState<Popup<any>[]>([])

  useEffect(() => {
    createPopup = <ResultType extends any>(
      popup: Omit<Popup<ResultType>, 'onDismiss'>,
    ) =>
      new Promise<ResultType>((resolve) => {
        const newPopup: Popup<ResultType> = {
          ...popup,
          onDismiss: resolve,
        }
        setPopups((popups) => popups.concat(newPopup))
      })
  }, [])

  if (popups.length === 0)
    return <div class={`${popupsWrapperStyle} ${hiddenWrapperStyle}`} />
  const currentPopup = popups[0]

  const close = (result: unknown) => {
    currentPopup.onDismiss?.(result)
    setPopups((popups) => popups.slice(1))
  }

  return (
    // eslint-disable-next-line caleb/jsx-a11y/click-events-have-key-events, caleb/jsx-a11y/no-static-element-interactions
    <div onClick={() => close(undefined)} class={popupsWrapperStyle}>
      <Card class={popupStyle} reff={positionPopup(currentPopup)}>
        {currentPopup.render(close)}
      </Card>
    </div>
  )
}

const positionPopup = (popup: Popup<unknown>) => (el: HTMLElement | null) => {
  if (!popup.targetElement || !el) return

  const space = 20

  const targetRect = popup.targetElement.getBoundingClientRect()
  const popupRect = el.getBoundingClientRect()
  const targetCenterX = targetRect.x + targetRect.width / 2
  const minHorizontalSpace = popupRect.width / 2 + space

  el.style.position = 'absolute'
  el.style.bottom = `${window.innerHeight - targetRect.top + space}px`
  if (targetCenterX < minHorizontalSpace) {
    el.style.left = `${space}px`
  } else if (window.innerWidth - targetCenterX < minHorizontalSpace) {
    el.style.right = `${space}px`
  } else {
    el.style.transform = 'translate(-50%)'
    el.style.left = `${targetCenterX}px`
  }
}

export let createPopup: <ResultType extends any>(
  popup: Omit<Popup<ResultType>, 'onDismiss'>,
) => Promise<ResultType> = () => {
  throw new Error('there is no place to render popups')
}
