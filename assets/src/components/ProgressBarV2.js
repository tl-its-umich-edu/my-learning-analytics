import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  gradedBar: {
    float: 'left',
    backgroundColor: 'steelblue'
  },
  outOfBar: {
    float: 'left',
    backgroundColor: 'grey'
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
    lines
  } = props

  const scoreRatio = score
    ? score / outOf
    : null

  const goalGradeRatio = goalGrade
    ? goalGrade / outOf
    : null

  return (
    <>
      {
        scoreRatio
          ? (
            <>
              <div
                className={classes.gradedBar}
                style={{ width: `${percentWidth * scoreRatio}%`, height }}
              />
              <div
                className={classes.outOfBar}
                style={{ width: `${percentWidth - percentWidth * scoreRatio}%`, height }}
              />
            </>
          )
          : <div
            className={classes.outOfBar}
            style={{ width: `${percentWidth}%`, height }}
          />
      }
    </>
  )
}

export default withStyles(styles)(ProgressBarV2)
