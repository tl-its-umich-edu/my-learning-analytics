import { useEffect, useState } from 'react'
import { sumAssignmentGoalGrade } from '../util/assignment'

const useMathWarning = (assignments, goalGrade) => {
  const [showMathWarning, setShowMathWarning] = useState(false)

  useEffect(() => {
    if (goalGrade) {
      if (assignments.filter(a => !(a.graded || a.goalGradeSetByUser)).length === 0) {
        setShowMathWarning(true)
      }
    }
  }, [sumAssignmentGoalGrade(assignments), goalGrade])

  return showMathWarning
}

export default useMathWarning
