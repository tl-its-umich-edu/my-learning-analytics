import { roundToOneDecimal } from './math'

const calculateAssignmentGoalsFromCourseGoal = (assignments, courseGoalGrade) => {

}

const calculateWeightOfAssignment = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentGrade = assignmentGroup.groupPoints > 0
    ? assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
    : 0
  return roundToOneDecimal(assignmentGrade)
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeightOfAssignment
}
