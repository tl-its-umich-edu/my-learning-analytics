import React from 'react'
import Line from './Line'
import Label from './Label'
import { withStyles } from '@material-ui/core/styles'
import { roundToXDecimals } from '../util/math'

const styles = theme => ({
  gradedBar: {
    backgroundColor: theme.palette.secondary.main
  },

  ungradedBar: {
    backgroundColor: theme.palette.info.main
  },

  outOfBar: {
    backgroundColor: theme.palette.negative.main
  }
})

function ProgressBarV2 (props) {
  const {
    classes,
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

  const calculateLineLeftOffset = (value, maxValue) => {
    if (value > maxValue) return 100
    if (value < 0) return 0
    return value / maxValue * 100
  }

  const calculateLableValue = (value, maxValue) => {
    if (value > maxValue) return 100
    if (value < 0) return 0
    return value
  }

  return (
    <>
      {
        <div
          tabIndex='0'
          aria-label={description !== undefined ? description : undefined}
          className={submitted && !score ? classes.ungradedBar : classes.outOfBar} // submitted assignment, and ungraded yet : otherwise
          style={{
            width: `${percentWidth}%`,
            height: `${height}px`,
            position: 'relative',
            margin: margin
          }}
          onFocus={(event) => { if (onBarFocus) onBarFocus(event.currentTarget) }}
          onBlur={(event) => { if (onBarBlur) onBarBlur() }}
        >
          {
            lines.length > 0
              ? lines.filter(line => line.value || line.value === 0) // filter any lines without value
                .map((line, key) => (
                  <div key={key}>
                    <Line
                      height={height}
                      left={`${calculateLineLeftOffset(line.value, outOf)}%`}
                      color={line.color}
                      labelPlacement={line.labelPlacement}
                    />
                    {
                      line.label
                        ? (
                          <Label
                            value={`${calculateLableValue(line.value, outOf)}`}
                            color={line.color}
                            labelText={`${line.label}: ${roundToXDecimals(line.value, 1)}%`}
                            labelPlacement={line.labelPlacement}
                          />
                        )
                        : null
                    }
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
    </>
  )
}

export default withStyles(styles)(ProgressBarV2)
