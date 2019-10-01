import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (goalGrade, assignments, assignmentGroups) => {
  const gradedAssignments = assignments
    .filter(a => a.graded || a.goalGradeSetByUser)

  const currentGrade = calculateMaxGrade(gradedAssignments, assignmentGroups)

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
  const assignmentGrade = assignmentGroup.groupPoints > 0
    ? assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
    : 0
  return roundToOneDecimal(assignmentGrade)
}

const calculateMaxGrade = (assignments, assignmentGroups) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .reduce((acc, a) => {
      const assignmentGrade = a.graded
        ? a.currentUserSubmission.score / a.pointsPossible
        : a.goalGradeSetByUser // if user sets assignment goal, use the set goal as part of grade calc.
          ? a.goalGrade / a.pointsPossible
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
const calculateCurrentGrade = (assignments, assignmentGroups) =>
  calculateMaxGrade(assignments.filter(a => a.graded), assignmentGroups)

const sumAssignmentGoalGrade = assignments => assignments
  .reduce((acc, a) => (acc += a.goalGrade || 0), 0)

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  sumAssignmentGoalGrade
}
