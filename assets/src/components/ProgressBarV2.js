import React from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  gradedBar: {
    float: 'left',
    height: '10px',
    backgroundColor: 'blue'
  },
  outOfBar: {
    float: 'left',
    height: '10px',
    backgroundColor: 'grey'
  }
})

function ProgressBarV2 (props) {
  const { classes, score, outOf, goalGrade, percentWidth, lines } = props

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
          ? <div className={classes.outOfBar} style={{ backgroundColor: 'grey', width: `${percentWidth}%` }} />
          : (
            <>
              <div className={classes.gradedBar} style={{ backgroundColor: 'blue', width: `${percentWidth * scoreRatio}%` }} />
              <div className={classes.outOfBar} style={{ backgroundColor: 'grey', width: `${percentWidth - percentWidth * scoreRatio}%` }} />
            </>
          )
      }
    </>
  )
}

export default withStyles(styles)(ProgressBarV2)
