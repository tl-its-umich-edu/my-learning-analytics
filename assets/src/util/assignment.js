import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (assignments, courseGoalGrade) => {

}

const calculateWeightedAssignmentGrade = (assignment, assignmentGroups) => {
  const { assignmentGroupId, pointsPossible } = assignment
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentGrade = assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
  return roundToOneDecimal(assignmentGrade)
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeightedAssignmentGrade
}
