import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (assignments, courseGoalGrade) => {

}

const calculateWeightOfAssignment = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentWeight = assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
  return roundToOneDecimal(assignmentWeight)
}

const calculateMaxPossibleCourseGrade = (assignments, assignmentGroups) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .filter(assignment => assignment.currentUserSubmission)
    .reduce((acc, assignment) => {
      const assignmentGrade = assignment.currentUserSubmission.score / assignment.pointsPossible
      const weightOfAssignment = calculateWeightOfAssignment(
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

// const calculateTotalCourseGrade

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeightOfAssignment,
  calculateMaxPossibleCourseGrade
}
