import React, { useEffect, useState, useRef } from 'react'
// import PropTypes from 'prop-types'
import StyledTextField from '../StyledTextField'
import { roundToXDecimals, getDecimalPlaceOfFloat } from '../../util/math'
import debounce from 'lodash.debounce'

function AssignmentGradeInput (props) {
  const {
    assignment,
    className,
    courseGoalGradeSet,
    handleAssignmentGoalGrade,
    handleInputFocus,
    handleInputBlur,
    gradeKey
  } = props

  // Use decimal place of pointsPossible if it's a decimal; otherwise, round to nearest tenth
  const placeToRoundTo = pointsPossible => (String(pointsPossible).includes('.'))
    ? getDecimalPlaceOfFloat(pointsPossible) : 1

  const previousGrade = useRef(assignment.goalGrade)
  const [goalGradeInternal, setGoalGradeInternal] = useState(roundToXDecimals(assignment.goalGrade, placeToRoundTo(assignment.pointsPossible)))
  const debouncedGoalGrade = useRef(debounce(grade => {
    handleAssignmentGoalGrade(gradeKey, grade, previousGrade.current)
    previousGrade.current = grade
  }, 500)).current

  useEffect(() => {
    previousGrade.current = assignment.goalGrade
  }, [assignment.goalGrade])

  const updateGoalGradeInternal = (grade) => {
    const roundedGrade = roundToXDecimals(grade, placeToRoundTo(assignment.pointsPossible))
    debouncedGoalGrade(roundedGrade)
    setGoalGradeInternal(roundedGrade)
  }

  useEffect(() => {
    setGoalGradeInternal(assignment.goalGrade)
  }, [assignment.goalGrade])

  return (
    <StyledTextField
      error={(assignment.goalGrade / assignment.pointsPossible) > 1}
      disabled={!courseGoalGradeSet}
      id='standard-number'
      value={goalGradeInternal}
      label={
        !courseGoalGradeSet ? 'Set a goal'
          : (assignment.goalGrade / assignment.pointsPossible) > 1
            ? 'Over 100%'
            : 'Set a goal'
      }
      onChange={event => {
        const assignmentGoalGrade = event.target.value
        updateGoalGradeInternal(assignmentGoalGrade)
      }}
      type='number'
      className={className}
      onFocus={() => handleInputFocus(gradeKey)}
      onBlur={() => handleInputBlur(gradeKey)}
    />
  )
}

AssignmentGradeInput.propTypes = {}

AssignmentGradeInput.defaultProps = {}

export default AssignmentGradeInput
