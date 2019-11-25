import { useEffect, useState } from 'react'

const useMathWarning = (assignments, goalGrade) => {
  const [showMathWarning, setShowMathWarning] = useState(false)

  useEffect(() => {
    if (assignments.filter(a => !(a.graded || a.goalGradeSetByUser)).length === 0) {
      setShowMathWarning(true)
    } else {
      setShowMathWarning(false)
    }
  })

  return showMathWarning
}

export default useMathWarning
