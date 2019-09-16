import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
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

  console.log(percentWidth)

  return (
    <>
      {
        <div
          className={classes.outOfBar}
          style={{ width: `${percentWidth}%`, height }}
        >
          {
            scoreRatio
              ? (
                <div
                  className={classes.gradedBar}
                  style={{ width: `${scoreRatio * 100}%`, height }}
                />
              )
              : null
          }
          {
            lines.length > 0
              ? (
                lines.map((line, key) => (
                  <div
                    style={{
                      position: 'relative',
                      width: '2px',
                      backgroundColor: line.color,
                      height,
                      left: `${line.value / outOf * 100}%`
                    }}
                    key={key}
                  />
                ))
              )
              : null
          }
        </div>
      }
    </>
  )
}

export default withStyles(styles)(ProgressBarV2)
