import { calculateWeekOffset, dateToMonthDay } from './date'
import { sum, roundToOneDecimal } from './math'

const clearGoals = assignments => assignments
  .map(a => {
    a.goalGrade = ''
    a.goalGradeSetByUser = null
    return a
  })

const setAssignmentGoalGrade = (key, assignments, assignmentGoalGrade) => {
  return [
    ...assignments.slice(0, key),
    {
      ...assignments[key],
      goalGrade: roundToOneDecimal(Number(assignmentGoalGrade)),
      goalGradeSetByUser: assignmentGoalGrade !== ''
    },
    ...assignments.slice(key + 1)
  ]
}

const setAssignmentGoalGradeState = (key, assignments, checkboxState) => {
  return [
    ...assignments.slice(0, key),
    {
      ...assignments[key],
      goalGradeSetByUser: checkboxState
    },
    ...assignments.slice(key + 1)
  ]
}

const gradedOrGoalGradeSetByUser = a => a.graded || a.goalGradeSetByUser
const notGradedOrGoalGradeSetByUser = a => !(a.graded || a.goalGradeSetByUser)

const calculateTotalPointsPossible = (assignments, assignmentGroups, assignmentWeightConsideration) => sum(
  assignments.map(
    a => assignmentWeightConsideration
      ? calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups)
      : a.pointsPossible
  )
)

const calculateAssignmentGoalsFromCourseGoal = (goalGrade, assignments, assignmentGroups, assignmentWeightConsideration) => {
  const gradedAssignments = assignments
    .filter(gradedOrGoalGradeSetByUser)
  const ungradedAssigmments = assignments
    .filter(notGradedOrGoalGradeSetByUser)

  const currentGrade = calculateMaxGrade(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalGradedAssignmentPoints = calculateTotalPointsPossible(gradedAssignments, assignmentGroups, assignmentWeightConsideration)
  const totalUngradedAssignmentPoints = calculateTotalPointsPossible(ungradedAssigmments, assignmentGroups, assignmentWeightConsideration)

  const percentageOfCourseUngraded = totalUngradedAssignmentPoints /
    (totalUngradedAssignmentPoints + totalGradedAssignmentPoints)

  const requiredGrade = (goalGrade - ((1 - percentageOfCourseUngraded) * currentGrade)) /
    (percentageOfCourseUngraded * 100)

  return assignments.map(a => {
    if (notGradedOrGoalGradeSetByUser(a)) {
      a.goalGrade = roundToOneDecimal(requiredGrade * a.pointsPossible) || ''
    }
    return a
  })
}

const calculateWeight = (pointsPossible, assignmentGroupId, assignmentGroups) => {
  const assignmentGroup = assignmentGroups.find(aGroup => aGroup.id === assignmentGroupId)
  const assignmentWeight = assignmentGroup.groupPoints > 0
    ? assignmentGroup.weight * (pointsPossible / assignmentGroup.groupPoints)
    : 0
  return assignmentWeight
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

const sortAssignmentsByWeek = assignments => {
  const assignmentsWithDueDates = assignments
    .filter(a => a.week)
    .sort((a, b) => a.week - b.week)

  const assignmentsWithoutDueDates = assignments
    .filter(a => !a.week)

  return [...assignmentsWithDueDates, ...assignmentsWithoutDueDates]
}

const createAssignmentFields = (assignments, assignmentGroups, courseStartDate, assignmentWeightConsideration) => {
  const totalPointsPossible = calculateTotalPointsPossible(assignments, assignmentGroups, assignmentWeightConsideration)
  return sortAssignmentsByWeek(
    assignments.map(a => {
      const {
        localDate,
        pointsPossible,
        assignmentGroupId,
        currentUserSubmission
      } = a

      a.week = calculateWeekOffset(courseStartDate, localDate)
      a.percentOfFinalGrade = roundToOneDecimal(
        assignmentWeightConsideration
          ? calculateWeight(pointsPossible, assignmentGroupId, assignmentGroups)
          : pointsPossible / totalPointsPossible * 100
      )
      a.outOf = pointsPossible
      a.graded = !!currentUserSubmission && !!currentUserSubmission.gradedDate
      a.dueDateMonthDay = dateToMonthDay(localDate)
      a.goalGrade = ''
      a.goalGradeSetByUser = null

      return a
    })
  )
}

const createUserSettings = (courseId, viewName, setting) => {
  const mutation = {
    variables: {
      input: {
        canvasCourseId: courseId,
        defaultViewType: viewName,
        defaultViewValue: JSON.stringify(setting)
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
  createUserSettings,
  clearGoals,
  setAssignmentGoalGrade,
  setAssignmentGoalGradeState
}
