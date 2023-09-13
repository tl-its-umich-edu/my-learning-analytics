import { useEffect, useState } from 'react'

const allAssignmentsHasGoalGrade = assignments =>
  assignments.filter(a => !(a.goalGradeSetByUser)).length === 0

const useMathWarning = assignments => {
  const [showMathWarning, setShowMathWarning] = useState(false)

  useEffect(() => {
    if (allAssignmentsHasGoalGrade(assignments)) {
      setShowMathWarning(true)
    } else {
      setShowMathWarning(false)
    }
  })

  return showMathWarning
}

export default useMathWarning
