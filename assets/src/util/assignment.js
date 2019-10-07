const calculateTotalPointsPossible = (assignments, assignmentGroups, assignmentWeightConsideration) => {
  return assignments.map(
    a => assignmentWeightConsideration
      ? calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups)
      : a.pointsPossible
  ).reduce((acc, cur) => (acc += cur), 0)
}

const calculateAssignmentGoalsFromCourseGoal = (goalGrade, assignments, assignmentGroups, assignmentWeightConsideration) => {
  const gradedAssignments = assignments
    .filter(a => a.graded || a.goalGradeSetByUser)
  const ungradedAssingments = assignments
    .filter(a => !(a.graded || a.goalGradeSetByUser))

  const currentGrade = calculateMaxGrade(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalGradedAssignmentPoints = calculateTotalPointsPossible(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalUngradedAssignmentPoints = calculateTotalPointsPossible(ungradedAssingments, assignmentGroups, assignmentWeightConsideration)

  const percentageOfCourseUngraded = totalUngradedAssignmentPoints / (totalUngradedAssignmentPoints + totalGradedAssignmentPoints)

  const requiredGrade = (goalGrade - ((1 - percentageOfCourseUngraded) * currentGrade)) / (percentageOfCourseUngraded * 100)

  return assignments.map(a => {
    if (!a.graded && !a.goalGradeSetByUser) {
      a.goalGrade = requiredGrade * a.pointsPossible
    }
    return a
  })
}

const calculateWeight = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentGrade = assignmentGroup.groupPoints > 0
    ? assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
    : 0
  return assignmentGrade
}

const calculateMaxGrade = (assignments, assignmentGroups, assignmentWeightConsideration) => {
  const [totalUserPoints, totalPossiblePoints] = assignments
    .reduce((acc, a) => {
      const assignmentGrade = a.graded
        ? a.currentUserSubmission.score / a.pointsPossible
        : a.goalGradeSetByUser // if user sets assignment goal, use the set goal as part of grade calc.
          ? a.goalGrade / a.pointsPossible
          : 1 // give a perfect score if assignment is not graded to calculate the max grade possible.

      const weightOfAssignment = assignmentWeightConsideration
        ? calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups)
        : a.pointsPossible

      const pointsTowardsFinalGrade = assignmentGrade * weightOfAssignment

      acc[0] += pointsTowardsFinalGrade
      acc[1] += weightOfAssignment
      return acc
    }, [0, 0])

  return (totalUserPoints / totalPossiblePoints * 100)
}

// calculateCurrentGrade ignores any ungraded assignments
const calculateCurrentGrade = (assignments, assignmentGroups, assignmentWeightConsideration) =>
  calculateMaxGrade(assignments.filter(a => a.graded), assignmentGroups, assignmentWeightConsideration)

const sumAssignmentGoalGrade = assignments => assignments
  .reduce((acc, a) => (acc += a.goalGrade || 0), 0)

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  sumAssignmentGoalGrade
}
