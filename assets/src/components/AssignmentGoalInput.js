import React, { useEffect, useState, useRef } from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import StyledTextField from './StyledTextField'
import debounce from 'lodash.debounce'
import { eventLogExtra } from '../util/object'
import useDebounce from '../hooks/useDebounce'

const styles = ({
  goalGradeInput: {
    marginTop: 0,
    width: 150
  }
})

function AssignmentGoalInput (props) {
  const {
    currentGrade,
    maxPossibleGrade,
    goalGrade,
    setGoalGrade,
    setEventLog,
    eventLog,
    handleClearGoalGrades,
    mathWarning,
    classes
  } = props

  const [goalGradeInternal, setGoalGradeInternal] = useState(goalGrade)
  const debouncedGoalGrade = useRef(debounce(q => setGoalGrade(q), 500)).current
  const updateGoalGradeInternal = (grade) => {
    const v = { courseGoalGrade: grade }
    if (goalGrade !== '') {
      // only send prev grade object when there is previous value
      v.prevCourseGoalGrade = goalGrade
    }
    setEventLog(eventLogExtra(v, eventLog, currentGrade, maxPossibleGrade))
    debouncedGoalGrade(grade)
    setGoalGradeInternal(grade)
  }

  useEffect(() => {
    setGoalGradeInternal(goalGrade)
  }, [goalGrade])

  return (
    <Grid item>
      <StyledTextField
        error={goalGradeInternal > 100 || mathWarning || goalGradeInternal > maxPossibleGrade}
        id='standard-number'
        value={goalGradeInternal}
        label={
          mathWarning
            ? 'Math may no longer add up'
            : goalGrade > 100
              ? 'Over 100%'
              : goalGrade > maxPossibleGrade
                ? 'Greater than max possible grade'
                : 'Set Minimum Goal'
        }
        onChange={event => {
          const goalGrade = event.target.value
          if (goalGrade === '') {
            updateGoalGradeInternal('')
          } else if (goalGrade <= 0) {
            updateGoalGradeInternal(0)
          } else if (goalGrade > 125) {
            updateGoalGradeInternal(125)
          } else {
            updateGoalGradeInternal(goalGrade)
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
