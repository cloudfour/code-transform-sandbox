import { h } from 'preact'
import {
  createProcessor,
  createTransformCache,
  Processor,
  TransformerError,
} from 'processor'
import { Card } from './card'
import { Transformer } from '../../transformer'
import { createPopup } from './popup'
import { css } from 'linaria'
import { allTransformers } from './transformers-list'
import clsx from 'clsx'
import { useState } from 'preact/hooks'
import { colors, textFonts } from './colors'

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
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-columns: 10rem;
  grid-auto-flow: column;
  grid-gap: ${timelineGap}rem;
  justify-content: center;
  z-index: 1;
  position: relative;
  min-width: 100%;
`

const transformerStyle = css`
  list-style-type: none;
  position: relative;
  overflow: visible;
  background: ${colors.bg};
  transition: transform 0.2s ease;
`

const spaceAfterTransformerStyle = css`
  z-index: -1;
  position: absolute;
  top: 0;
  height: 100%;
  left: 100%;
  width: ${timelineGap}rem;
  /* transform-origin: left center; */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateX(${(hoverTimelineGap - timelineGap) / 2}rem);
    /* transform: scaleX(${hoverTimelineGap / timelineGap}); */
    & > * {
      /* transform: scale(${timelineGap / hoverTimelineGap}, 1); */
    }
  }

  & > * {
    /* transform: scale(1); */
  }
`

const NewTransformerPopup = ({
  close,
}: {
  close: (transformer: Transformer<any>) => void
}) => (
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

interface Props {
  processor: Processor
  onChange: (processor: Processor) => void
  openSettings: (transformerIndex: number) => void
  selectedTransformerIndex: number | null
  error: TransformerError | null
}

export const Timeline = ({
  processor,
  onChange,
  openSettings,
  selectedTransformerIndex,
  error,
}: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const handleAddTransformer = (newTransformerIndex: number) => async (
    e: h.JSX.TargetedEvent<HTMLElement>,
  ) => {
    const newTransformer = await createPopup<Transformer<any> | undefined>({
      targetElement: e.currentTarget,
      render: (close) => {
        return <NewTransformerPopup close={close} />
      },
    })
    if (!newTransformer) return
    const newTransformers = processor.transformers.slice()
    newTransformers.splice(newTransformerIndex, 0, {
      isEnabled: true,
      transformer: newTransformer,
      options: newTransformer.defaultOptions,
      cache: createTransformCache(),
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

  const removeTransformer = (i: number) => {
    const newTransformers = processor.transformers.slice()
    newTransformers.splice(i, 1)
    onChange(createProcessor(newTransformers))
  }

  const toggleEnabled = (i: number) => {
    const newTransformers = processor.transformers.slice()
    const existingTransformer = processor.transformers[i]
    newTransformers[i] = {
      ...existingTransformer,
      isEnabled: !existingTransformer.isEnabled,
    }
    onChange(createProcessor(newTransformers))
  }

  if (processor.transformers.length === 0) {
    return (
      <div class={timelineStyle}>
        <button
          class={css`
            padding: 1rem;
            box-shadow: 2px 2px 19px 2px black;
            cursor: pointer;
            border: none;
            border-radius: 0.5rem;
            color: ${colors.fg};
            background: ${colors.bg};
            font-family: ${textFonts};
            font-size: 1.2rem;
            transition: background-color 0.2s ease;

            &:hover,
            &:focus {
              background: ${colors.bg1};
            }
          `}
          onClick={handleAddTransformer(0)}
        >
          Add a transformer
        </button>
      </div>
    )
  }

  return (
    <ol class={timelineStyle}>
      {processor.transformers.map((transformer, i) => {
        return (
          // eslint-disable-next-line caleb/react/jsx-key
          <li
            class={transformerStyle}
            style={{
              transform:
                hoveredIndex === null
                  ? ''
                  : hoveredIndex < i
                  ? `translate(${(hoverTimelineGap - timelineGap) / 2}rem)`
                  : `translate(-${(hoverTimelineGap - timelineGap) / 2}rem)`,
            }}
          >
            <TransformerCard
              hasSettingsOpen={i === selectedTransformerIndex}
              remove={() => removeTransformer(i)}
              transformer={transformer.transformer}
              toggleEnabled={() => toggleEnabled(i)}
              openSettings={() => openSettings(i)}
              isEnabled={transformer.isEnabled}
              hasError={i === error?.transformerIndex}
            />
            <div
              class={spaceAfterTransformerStyle}
              onMouseEnter={handleHoverBetween(i)}
              onMouseLeave={handleHoverBetween(i)}
            >
              <button onClick={handleAddTransformer(i + 1)}>
                {`add a transformer after ${transformer.transformer.name}`}
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const transformerCardStyle = css`
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

const transformerCardActiveStyle = css`
  background: ${colors.bg1};
`

const transformerCardLoadingStyle = css`
  & > * {
    opacity: 0.8;
  }
`

const transformerCardErrorStyle = css`
  background: ${colors.red};
  color: ${colors.bg};
`

const transformerCardDisabledStyle = css`
  background: black;
  & > * {
    opacity: 0.6;
  }
  & > .${transformerNameStyle} {
    text-decoration: line-through;
  }
`

const TransformerCard = ({
  transformer,
  openSettings,
  remove,
  toggleEnabled,
  isEnabled,
  hasSettingsOpen,
  hasError,
}: {
  transformer: Transformer<any>
  openSettings: () => void
  remove: () => void
  toggleEnabled: () => void
  isEnabled: boolean
  hasError: boolean
  hasSettingsOpen: boolean
}) => {
  return (
    <Card
      as="button"
      class={clsx(
        transformerCardStyle,
        hasSettingsOpen && transformerCardActiveStyle,
        !isEnabled && transformerCardDisabledStyle,
        !transformer.cachedTransformer && transformerCardLoadingStyle,
        hasError && transformerCardErrorStyle,
      )}
    >
      <div class={transformerNameStyle}>{transformer.name}</div>
      <button onClick={openSettings}>Settings</button>
      <button onClick={remove}>Remove</button>
      <button onClick={toggleEnabled}>
        {isEnabled ? 'Disable' : 'Enable'}
      </button>
    </Card>
  )
}
