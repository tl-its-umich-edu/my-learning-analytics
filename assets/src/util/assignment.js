import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (assignments, courseGoalGrade) => {

}

const calculateWeight = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentWeight = assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
  return roundToOneDecimal(assignmentWeight)
}

const calculateMaxGrade = (assignments, assignmentGroups) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .reduce((acc, assignment) => {
      const assignmentGrade = assignment.graded
        ? assignment.currentUserSubmission.score / assignment.pointsPossible
        : 1 // give a perfect score if assignment is not graded to calculate the max grade possible.

      const weightOfAssignment = calculateWeight(
        assignment.pointsPossible,
        assignment.assignmentGroupId,
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
    assignments.filter(assignment => assignment.graded), assignmentGroups
  )
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade
}
