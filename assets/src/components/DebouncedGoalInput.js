import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import StyledTextField from './StyledTextField'
import { roundToXDecimals, placeToRoundTo } from '../util/math'
import useDebounce from '../hooks/useDebounce'

const styles = theme => ({
  goalGradeInput: {
    marginTop: 0,
    width: 100,
    marginBottom: '10px'
  }
})

function DebouncedGoalInput (props) {
  const {
    classes,
    goalGrade,
    pointsPossible,
    disabled,
    handleAssignmentGoalGrade,
    id
  } = props

  const [tempGrade, setTempGrade] = useState(0)
  const debouncedGrade = useDebounce(tempGrade, 500)

  useEffect(() => {
    if (goalGrade) {
      setTempGrade(goalGrade)
    }
  }, [goalGrade])

  useEffect(() => {
    console.log(debouncedGrade)
    if (debouncedGrade) {
      handleAssignmentGoalGrade(id, debouncedGrade)
    }
  }, [debouncedGrade, id])

  return (
    <StyledTextField
      error={(goalGrade / pointsPossible) > 1}
      disabled={disabled}
      id='standard-number'
      value={roundToXDecimals(tempGrade, placeToRoundTo(pointsPossible))}
      label={
        !disabled ? 'Set a goal'
          : (goalGrade / pointsPossible) > 1
            ? 'Over 100%'
            : 'Set a goal'
      }
      onChange={event => {
        const assignmentGoalGrade = event.target.value
        setTempGrade(assignmentGoalGrade)
      }}
      type='number'
      className={classes.goalGradeInput}
    />
  )
}

DebouncedGoalInput.propTypes = {
  id: PropTypes.string.isRequired,
  goalGrade: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pointsPossible: PropTypes.number // seems like it should be required
}

DebouncedGoalInput.defaultProps = {}

export default withStyles(styles)(DebouncedGoalInput)