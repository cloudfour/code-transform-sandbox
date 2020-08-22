import { h } from 'preact'
import { createProcessor, Processor } from 'processor'
import { Card } from './card'
import { Transformer } from '../../transformer'
import { createPopup } from './popup'
import { css } from 'linaria'
import { allTransformers } from './transformers-list'
import clsx from 'clsx'
import { useState } from 'preact/hooks'
import { colors } from './colors'

interface Props {
  processor: Processor
  onChange: (processor: Processor) => void
}

const newTransformerStyle = css`
  padding: 1.2rem;
  display: grid;
  gap: 0.2rem;

  & h1 {
    margin: 0;
  }
`

const timelineGap = 4
const hoverTimelineGap = 8

const timelineStyle = css`
  padding: 0;
  margin: 0;
  overflow-x: auto;
  display: flex;
  justify-content: center;
  z-index: 1;
  padding: 2rem;
`

const transformerStyle = css`
  list-style-type: none;
  position: relative;
  overflow: visible;
  width: 10rem;
  background: ${colors.bg};

  &:not(:last-child) {
    margin-right: ${timelineGap}rem;
  }
`

const spaceAfterTransformerStyle = css`
  z-index: -1;
  position: absolute;
  top: 0;
  height: 100%;
  left: 100%;
  width: ${timelineGap}rem;
  transform-origin: left center;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: scaleX(${hoverTimelineGap / timelineGap});
    & > * {
      transform: scale(${timelineGap / hoverTimelineGap}, 1);
    }
  }

  & > * {
    transform: scale(1);
  }
`

export const Timeline = ({ processor, onChange }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const handleAddTransformer = (newTransformerIndex: number) => async (
    e: h.JSX.TargetedEvent<HTMLElement>,
  ) => {
    const newTransformer = await createPopup<Transformer<any> | undefined>({
      targetElement: e.currentTarget,
      render: (close) => {
        return (
          <div class={newTransformerStyle}>
            <h1>Add a transformer</h1>
            <ul>
              {allTransformers.map((transformer) => {
                return (
                  // eslint-disable-next-line caleb/react/jsx-key
                  <li>
                    <button
                      onClick={() => {
                        close(transformer)
                      }}
                    >{`${transformer.name} ${transformer.version}`}</button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      },
    })
    if (!newTransformer) return
    const newTransformers = processor.transformers.slice()
    newTransformers.splice(newTransformerIndex, 0, {
      transformer: newTransformer,
      options: newTransformer.defaultOptions,
    })
    onChange(createProcessor(newTransformers))
  }

  const handleHoverBetween = (i: number) => (
    e: h.JSX.TargetedMouseEvent<HTMLDivElement>,
  ) => {
    const el = e.currentTarget
    if (el.matches(':hover')) {
      setHoveredIndex(i)
    } else {
      setHoveredIndex(null)
    }
  }

  if (processor.transformers.length === 0) {
    return <button onClick={handleAddTransformer(0)}>add a transformer</button>
  }

  return (
    <ol class={timelineStyle}>
      {processor.transformers.map((transformer, i) => {
        return (
          // eslint-disable-next-line caleb/react/jsx-key
          <li
            class={clsx(transformerStyle)}
            style={{
              transform:
                hoveredIndex === null
                  ? null
                  : hoveredIndex < i
                  ? `translate(${(hoverTimelineGap - timelineGap) / 2}rem)`
                  : `translate(-${(hoverTimelineGap - timelineGap) / 2}rem)`,
            }}
          >
            <TransformerButton transformer={transformer.transformer} />
            <div
              class={spaceAfterTransformerStyle}
              onMouseEnter={handleHoverBetween(i)}
              onMouseLeave={handleHoverBetween(i)}
            >
              <button onClick={handleAddTransformer(i + 1)}>
                add a transformer after
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const transformerButtonStyle = css`
  border: none;
  background: inherit;
  height: 100%;
  width: 100%;
  display: grid;
  align-items: center;
  color: ${colors.fg}
  padding: 1rem;
`

const transformerNameStyle = css`
  font-size: 1.2rem;
`

const TransformerButton = ({
  transformer,
}: {
  transformer: Transformer<any>
}) => {
  return (
    <Card as="button" class={transformerButtonStyle}>
      <div class={transformerNameStyle}>{transformer.name}</div>
      <button>Settings</button>
    </Card>
  )
}
