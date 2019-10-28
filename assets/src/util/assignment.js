import { calculateWeekOffset, dateToMonthDay } from './date'
import { sum } from './math'

const calculateTotalPointsPossible = (assignments, assignmentGroups, assignmentWeightConsideration) => sum(
  assignments.map(
    a => assignmentWeightConsideration
      ? calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups)
      : a.pointsPossible
  )
)

const calculateAssignmentGoalsFromCourseGoal = (goalGrade, assignments, assignmentGroups, assignmentWeightConsideration) => {
  const gradedAssignments = assignments
    .filter(a => a.graded || a.goalGradeSetByUser)
  const ungradedAssingments = assignments
    .filter(a => !(a.graded || a.goalGradeSetByUser))

  const currentGrade = calculateMaxGrade(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalGradedAssignmentPoints = calculateTotalPointsPossible(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalUngradedAssignmentPoints = calculateTotalPointsPossible(ungradedAssingments, assignmentGroups, assignmentWeightConsideration)

  const percentageOfCourseUngraded = totalUngradedAssignmentPoints /
    (totalUngradedAssignmentPoints + totalGradedAssignmentPoints)

  const requiredGrade = (goalGrade - ((1 - percentageOfCourseUngraded) * currentGrade)) /
    (percentageOfCourseUngraded * 100)

  return assignments.map(a => {
    if (!(a.graded || a.goalGradeSetByUser)) {
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

  return totalPossiblePoints > 0
    ? (totalUserPoints / totalPossiblePoints * 100)
    : 0
}

// calculateCurrentGrade ignores any ungraded assignments
const calculateCurrentGrade = (assignments, assignmentGroups, assignmentWeightConsideration) =>
  calculateMaxGrade(assignments.filter(a => a.graded), assignmentGroups, assignmentWeightConsideration)

const sumAssignmentGoalGrade = assignments => sum(
  assignments.map(a => a.goalGrade || 0)
)

const sortAssignmentsByWeek = assignments => assignments.sort((a, b) => a.week - b.week)

const createAssignmentFields = (assignments, assignmentGroups, dateStart) => sortAssignmentsByWeek(
  assignments.map(a => {
    const {
      dueDate,
      pointsPossible,
      assignmentGroupId,
      currentUserSubmission
    } = a

    const courseStartDate = dateStart

    a.week = calculateWeekOffset(courseStartDate, dueDate)
    a.percentOfFinalGrade = calculateWeight(pointsPossible, assignmentGroupId, assignmentGroups)
    a.outOf = pointsPossible
    a.graded = !!currentUserSubmission && !!currentUserSubmission.gradedDate
    a.dueDateMonthDay = dateToMonthDay(dueDate)

    return a
  })
)

const createUserSettings = (goalGrade, courseId, viewName, assignments) => {
  const assignmentsSetByUser = assignments
    .filter(a => a.goalGradeSetByUser)
    .map(({ id, goalGradeSetByUser, goalGrade }) => (
      {
        assignmentId: id,
        goalGradeSetByUser,
        goalGrade
      }
    ))

  const mutation = {
    variables: {
      input: {
        canvasCourseId: courseId,
        defaultViewType: viewName,
        defaultViewValue: JSON.stringify({
          goalGrade: goalGrade,
          assignments: assignmentsSetByUser
        })
      }
    }
  }

  return mutation
}

export {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  sumAssignmentGoalGrade,
  createAssignmentFields,
  createUserSettings
}
