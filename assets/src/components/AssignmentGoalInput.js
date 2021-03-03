import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import StyledTextField from './StyledTextField'

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
    <Grid item>
      <StyledTextField
        error={goalGrade > 100 || mathWarning || goalGrade > maxPossibleGrade}
        id='standard-number'
        value={goalGrade}
        label={
          mathWarning
            ? 'Scores no longer match goal'
            : goalGrade > 100
              ? 'Over 100%'
              : goalGrade > maxPossibleGrade
                ? 'Greater than max possible grade'
                : 'Set Minimum Goal'
        }
        onChange={event => {
          const goalGrade = event.target.value
          if (goalGrade === '') {
            setGoalGrade('')
          } else if (goalGrade <= 0) {
            setGoalGrade(0)
          } else if (goalGrade > 125) {
            setGoalGrade(125)
          } else {
            setGoalGrade(goalGrade)
          }
        }}
        type='number'
        className={classes.goalGradeInput}
        margin='normal'
        variant='outlined'
        style={{ marginRight: '10px', width: '25ch' }}
      />
      {
        <Button
          variant='contained'
          className={classes.clearButton}
          onClick={handleClearGoalGrades}
          aria-label='clear'
        >
          Clear
        </Button>
      }
    </Grid>
  )
}

export default withStyles(styles)(AssignmentGoalInput)
