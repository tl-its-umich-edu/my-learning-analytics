import { useEffect, useState } from 'react'

const allAssignmentsAreGradedOrHasGoalGrade = assignments =>
  assignments.filter(a => !(a.graded || a.goalGradeSetByUser)).length === 0

const useMathWarning = assignments => {
  const [showMathWarning, setShowMathWarning] = useState(false)

  useEffect(() => {
    if (allAssignmentsAreGradedOrHasGoalGrade(assignments)) {
      setShowMathWarning(true)
    } else {
      setShowMathWarning(false)
    }
  })

  return showMathWarning
}

export default useMathWarning
