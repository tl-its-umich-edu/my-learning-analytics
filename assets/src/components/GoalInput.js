import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import StyledTextField from './StyledTextField'

const styles = theme => ({
  goalGradeInput: {
    marginTop: 0,
    width: 100,
    marginBottom: '10px'
  }
})

function GoalInput (props) {
  const {
    classes,
    goalGrade,
    pointsPossible,
    disabled,
    handleAssignmentGoalGrade
  } = props

  return (
    <StyledTextField
      error={(goalGrade / pointsPossible) > 1}
      disabled={disabled}
      id='standard-number'
      value={goalGrade}
      label={
        !disabled ? 'Set a goal'
          : (goalGrade / pointsPossible) > 1
            ? 'Over 100%'
            : 'Set a goal'
      }
      onChange={event => {
        const goalGrade = event.target.value
        handleAssignmentGoalGrade(goalGrade)
      }}
      type='number'
      className={classes.goalGradeInput}
    />
  )
}

GoalInput.propTypes = {
  goalGrade: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pointsPossible: PropTypes.number // seems like it should be required
}

GoalInput.defaultProps = {}

export default withStyles(styles)(GoalInput)
