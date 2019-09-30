import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'

const styles = ({
  numberField: {
    width: 80
  }
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
        <Typography variant='h5'>Current Grade</Typography>
        <Typography variant='h4' style={{ color: 'steelblue' }}>
          {`${currentGrade}%`}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant='h5'>Max Possible Grade</Typography>
        <Typography variant='h4' style={{ color: 'grey' }}>
          {`${maxPossibleGrade}%`}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant='h5'>Goal</Typography>
        <TextField
          id='standard-number'
          value={goalGrade || ''}
          label={goalGrade ? '' : 'Set Goal'}
          onChange={event => setGoalGrade(Number(event.target.value))}
          type='number'
          className={classes.numberField}
          InputLabelProps={{
            // endAdornment: <InputAdornment position='start'>%</InputAdornment> // doesn't seem to be working
          }}
          margin='normal'
        />
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(AssignmentGradeBoxes)
