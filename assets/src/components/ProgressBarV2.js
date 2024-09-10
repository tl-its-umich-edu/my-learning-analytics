import React from 'react'
import { styled } from '@mui/material/styles'
import Line from './Line'
const PREFIX = 'ProgressBarV2'

const classes = {
  gradedBar: `${PREFIX}-gradedBar`,
  ungradedBar: `${PREFIX}-ungradedBar`,
  outOfBar: `${PREFIX}-outOfBar`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.gradedBar}`]: {
    backgroundColor: theme.palette.secondary.main
  },

  [`& .${classes.ungradedBar}`]: {
    backgroundColor: theme.palette.info.main
  },

  [`& .${classes.outOfBar}`]: {
    backgroundColor: theme.palette.negative.main
  }
}))

function ProgressBarV2 (props) {
  const {
    score,
    outOf,
    submitted,
    percentWidth,
    height = 10,
    margin,
    lines = [],
    description,
    onBarFocus,
    onBarBlur
  } = props

  const scoreRatio = score
    ? score / outOf
    : null

  return (
    <Root>
      {
        <div
          aria-label={description !== undefined ? description : undefined}
          className={submitted && !score ? classes.ungradedBar : classes.outOfBar} // submitted assignment, and ungraded yet : otherwise
          style={{
            width: `${percentWidth}%`,
            height: `${height}px`,
            position: 'relative',
            margin
          }}
          onFocus={(event) => { if (onBarFocus) onBarFocus(event.currentTarget) }}
          onBlur={(event) => { if (onBarBlur) onBarBlur() }}
        >
          {
            lines.length > 0
              ? lines.filter(line => line.value || line.value === 0) // filter any lines without value
                .map((line, key) => (
                  <div key={key}>
                    <Line {...line} barHeight={height} outOf={outOf} />
                  </div>
                ))
              : null
          }
          {
            scoreRatio
              ? (
                <div
                  className={classes.gradedBar}
                  style={{
                    position: 'absolute',
                    display: 'inline-block',
                    width: `${(scoreRatio * 100) > 100 ? 100 : scoreRatio * 100}%`,
                    height: `${height}px`
                  }}
                />
                )
              : null
          }
        </div>
      }
    </Root>
  )
}

export default (ProgressBarV2)
