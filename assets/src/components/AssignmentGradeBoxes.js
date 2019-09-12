import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'

const styles = theme => ({

})

function AssignmentGradeBoxes (props) {
  const {
    currentGrade,
    maxPossibleGrade,
    goalGrade,
    setGoalGrade,
    classes
  } = props

  return (
    <Grid container>
      <Grid item xs={4}>
        <Typography>Current Grade</Typography>
        <Typography>{currentGrade}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>Max Possible Grade</Typography>
        <Typography>{maxPossibleGrade}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>Goal</Typography>
        <TextField
          id='standard-number'
          value={goalGrade}
          onChange={event => setGoalGrade(event.target.value)}
          type='number'
          className={classes.numberField}
          InputLabelProps={{ shrink: true }}
          margin='normal'
        />
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(AssignmentGradeBoxes)
