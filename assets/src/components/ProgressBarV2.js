import React from 'react'
import Line from './Line'
import Label from './Label'
import { withStyles } from '@material-ui/core/styles'
import { roundToXDecimals } from '../util/math'
// import { DropTarget } from 'react-dnd'

const styles = ({
  gradedBar: {
    float: 'left',
    backgroundColor: 'steelblue'
  },
  outOfBar: {
    float: 'left',
    backgroundColor: '#f1f1f1'
  }
})

function ProgressBarV2 (props) {
  const {
    classes,
    score,
    outOf,
    percentWidth,
    height = 10,
    margin = 0,
    lines = []
  } = props

  const scoreRatio = score
    ? score / outOf
    : null

  const calculateLineLeftOffset = (value, maxValue) => {
    if (value > maxValue) return 100
    if (value < 0) return 0
    return value / maxValue * 100
  }

  return (
    <>
      {
        <div
          className={classes.outOfBar}
          style={{
            width: `${percentWidth}%`,
            height: `${height}px`,
            position: 'relative',
            margin: `${margin}px`
          }}
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
                            left={`${calculateLineLeftOffset(line.value, outOf) + 0.5}%`}
                            color={line.color}
                            labelText={`${line.label}: ${roundToXDecimals(line.value, 1)}%`}
                            labelPlacement={line.labelPlacement}
                            extraLineHeight={line.value > 75 ? '20' : '0'}
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
