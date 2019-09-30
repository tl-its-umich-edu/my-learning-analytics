import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (goalGrade, currentGrade, assignments, assignmentGroups) => {
  const gradedAssignments = assignments.filter(a => a.graded || a.goalGradeSetByUser)

  const weightOfGradedAssignments = gradedAssignments
    .map(a => calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups))
    .reduce((acc, cur) => (acc += cur), 0) / 100

  const ungradedAssignmentGrade = (goalGrade - currentGrade * weightOfGradedAssignments) /
    (1 - weightOfGradedAssignments)

  return assignments.map(a => {
    if (!a.graded && !a.goalGradeSetByUser) {
      a.goalGrade = ungradedAssignmentGrade / 100 * a.pointsPossible
    }
    return a
  })
}

const calculateWeight = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentWeight = assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
  return roundToOneDecimal(assignmentWeight)
}

const calculateMaxGrade = (assignments, assignmentGroups) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .reduce((acc, a) => {
      const assignmentGrade = a.graded
        ? a.currentUserSubmission.score / a.pointsPossible
        : 1 // give a perfect score if assignment is not graded to calculate the max grade possible.

      const weightOfAssignment = calculateWeight(
        a.pointsPossible,
        a.assignmentGroupId,
        assignmentGroups
      )
      const pointsTowardsFinalGrade = assignmentGrade * weightOfAssignment

      acc[0] += pointsTowardsFinalGrade
      acc[1] += weightOfAssignment
      return acc
    }, [0, 0])

  return roundToOneDecimal(totalUserPoints / totalPossiblePoints * 100)
}

// calculateCurrentGrade ignores any ungraded assignments
const calculateCurrentGrade = (assignments, assignmentGroups) => {
  return calculateMaxGrade(
    assignments.filter(a => a.graded), assignmentGroups
  )
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade
}
