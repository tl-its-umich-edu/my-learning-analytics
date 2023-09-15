import { useEffect, useState } from 'react'

// this is the case when either few assignments are graded or few has goal grade.
// if an assignment is graded then it won't have goal grade.
const isFewAssignmentsAreGradedOrHasGoalGrade = assignments =>
  assignments.filter(a => !(a.graded || a.goalGradeSetByUser)).length === 0

// this is the case when all assignments are graded and design won't allow assignment goal setting but course grade is allowed
const allAssignmentsAreGraded = assignments => assignments.filter(a => !(a.graded)).length === 0

const useMathWarning = assignments => {
  const [showMathWarning, setShowMathWarning] = useState(false)

  useEffect(() => {
    if (allAssignmentsAreGraded(assignments)) {
      setShowMathWarning(false)
    } else if (isFewAssignmentsAreGradedOrHasGoalGrade(assignments)) {
      setShowMathWarning(true)
    } else {
      setShowMathWarning(false)
    }
  })

  return showMathWarning
}

export default useMathWarning
