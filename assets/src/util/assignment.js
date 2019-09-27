import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (assignments, courseGoalGrade) => {

}

const calculateWeightOfAssignment = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentGrade = assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
  return roundToOneDecimal(assignmentGrade)
}

const calculateMaxPossibleCourseGrade = (assignments, assignmentGroups) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .filter(assignment => assignment.currentUserSubmission)
    .reduce((acc, assignment) => {
      const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignment.assignmentGroupId)
      const assignmentGrade = assignment.currentUserSubmission.score / assignment.pointsPossible
      const totalPointsPossible = assignmentGroup.weight * (assignment.pointsPossible / assignmentGroup.groupPoints)
      const pointsTowardsFinalGrade = assignmentGrade * totalPointsPossible

      acc[0] += pointsTowardsFinalGrade
      acc[1] += totalPointsPossible
      return acc
    }, [0, 0])
  return roundToOneDecimal(totalUserPoints / totalPossiblePoints * 100)
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeightOfAssignment,
  calculateMaxPossibleCourseGrade
}
