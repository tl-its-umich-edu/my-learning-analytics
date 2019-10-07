import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { roundToOneDecimal } from '../util/math'

const styles = ({
  goalGradeInput: {
    marginTop: 0,
    width: 150
  }
})

function AssignmentGradeBoxes (props) {
  const {
    currentGrade,
    maxPossibleGrade,
    goalGrade,
    setGoalGrade,
    handleResetClick,
    classes
  } = props

  return (
    <Grid container>
      <Grid item xs={2}>
        <Typography variant='h5'>Current Grade</Typography>
        <Typography variant='h4' style={{ color: 'steelblue' }}>
          {`${roundToOneDecimal(currentGrade)}%`}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant='h5'>Max Possible Grade</Typography>
        <Typography variant='h4' style={{ color: 'grey' }}>
          {`${roundToOneDecimal(maxPossibleGrade)}%`}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Typography variant='h5'>Goal</Typography>
        <TextField
          error={goalGrade > 100}
          id='standard-number'
          value={goalGrade || ''}
          label={
            goalGrade > 100
              ? 'Over 100%'
              : 'Set a goal'
          }
          onChange={event => setGoalGrade(Number(event.target.value))}
          type='number'
          className={classes.goalGradeInput}
          InputLabelProps={{
            // endAdornment: <InputAdornment position='start'>%</InputAdornment> // doesn't seem to be working
          }}
          margin='normal'
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          variant='contained'
          className={classes.clearButton}
          onClick={handleResetClick}
        >
          {'Clear goal grades'}
        </Button>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(AssignmentGradeBoxes)
