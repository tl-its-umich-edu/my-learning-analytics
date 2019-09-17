import React from 'react'
import Line from './Line'
import { withStyles } from '@material-ui/core/styles'
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
    goalGrade,
    percentWidth,
    height = '10px',
    lines = []
  } = props

  const scoreRatio = score
    ? score / outOf
    : null

  const goalGradeRatio = goalGrade
    ? goalGrade / outOf
    : null

  const calculateLineLeftOffset = (value, maxValue) => {
    if (value > maxValue) return maxValue
    if (value < 0) return 0
    else return value / maxValue * 100
  }

  return (
    <>
      {
        <div
          className={classes.outOfBar}
          style={{
            width: `${percentWidth}%`,
            height,
            position: 'relative'
          }}
        >
          {
            lines.length > 0
              ? lines.map((line, key) => (
                <Line
                  className='handle'
                  height={height}
                  left={`${calculateLineLeftOffset(line.value, outOf)}%`}
                  color={line.color}
                  key={key}
                />
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
                    width: `${scoreRatio * 100}%`,
                    height
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
