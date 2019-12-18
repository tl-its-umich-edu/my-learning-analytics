import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import StyledTextField from './StyledTextField'
import LayersClearIcon from '@material-ui/icons/LayersClear'

const styles = ({
  goalGradeInput: {
    marginTop: 0,
    width: 150
  }
})

function AssignmentGoalInput (props) {
  const {
    maxPossibleGrade,
    goalGrade,
    setGoalGrade,
    handleClearGoalGrades,
    mathWarning,
    classes
  } = props

  return (
    <Grid container>
      <Grid item xs={3} style={{ display: 'inline-block' }}>
        {/* <Typography variant='h6' display='inline'>Goal</Typography> */}
        <StyledTextField
          error={goalGrade > 100 || mathWarning || goalGrade > maxPossibleGrade}
          id='standard-number'
          value={goalGrade || ''}
          label={
            mathWarning
              ? 'Math may no longer add up'
              : goalGrade > 100
                ? 'Over 100%'
                : goalGrade > maxPossibleGrade
                  ? 'Greater than max possible grade'
                  : 'Set a goal'
          }
          onChange={event => setGoalGrade(Number(event.target.value))}
          type='number'
          className={classes.goalGradeInput}
          InputLabelProps={{
            // endAdornment: <InputAdornment position='start'>%</InputAdornment> // doesn't seem to be working
          }}
          margin='normal'
          variant='outlined'
        />
        {
          goalGrade
            ? (
              <Button
                variant='contained'
                className={classes.clearButton}
                onClick={handleClearGoalGrades}
              >
                <LayersClearIcon />
              </Button>
            )
            : null
        }
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(AssignmentGoalInput)
