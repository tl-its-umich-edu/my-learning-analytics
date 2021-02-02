import { calculateWeekOffset, dateToMonthDay } from './date'
import { sum, roundToXDecimals } from './math'

const clearGoals = assignments => assignments
  .map(a => {
    a.goalGrade = ''
    a.goalGradeSetByUser = false
    return a
  })

const setAssigmentGoalInputState = (assignmentId, assignments, inputFocus) => {
  const assignment = assignments.filter(a => a.id === assignmentId)
  if (assignment.length !== 1) {
    console.error('Error finding unique assignment id')
    return assignments
  } else {
    const key = assignments.indexOf(assignment[0])
    return [
      ...assignments.slice(0, key),
      {
        ...assignments[key],
        inputFocus,
        inputBlur: !inputFocus
      },
      ...assignments.slice(key + 1)
    ]
  }
}

const setAssignmentGoalGrade = (assignmentId, assignments, goalGrade) => {
  const assignment = assignments.filter(a => a.id === assignmentId)[0]
  if (!assignment) {
    console.error('Error finding unique assignment id')
    return assignments
  } else {
    const key = assignments.indexOf(assignment)
    return [
      ...assignments.slice(0, key),
      {
        ...assignments[key],
        goalGrade: goalGrade === '' ? '' : roundToXDecimals(Number(goalGrade), 3),
        goalGradeSetByUser: !!goalGrade
      },
      ...assignments.slice(key + 1)
    ]
  }
}

const setAssignmentGoalLockState = (assignmentId, assignments, checkboxState) => {
  const assignment = assignments.filter(a => a.id === assignmentId)
  if (assignment.length !== 1) {
    console.error('Error finding unique assignment id')
    return assignments
  } else {
    const key = assignments.indexOf(assignment[0])
    return [
      ...assignments.slice(0, key),
      {
        ...assignments[key],
        goalGradeSetByUser: !!checkboxState
      },
      ...assignments.slice(key + 1)
    ]
  }
}

const calculateTotalPointsPossible = (assignments, assignmentGroups, assignmentWeightConsideration) => sum(
  assignments.map(
    a => assignmentWeightConsideration
      ? calculateWeight(a.pointsPossible, a.assignmentGroupId, assignmentGroups)
      : a.pointsPossible
  )
)

const gradedOrGoalGradeSetByUser = a => a.graded || a.goalGradeSetByUser
const notGradedOrGoalGradeSetByUser = a => !(a.graded || a.goalGradeSetByUser)

const calculateAssignmentGoalsFromCourseGoal = (
  goalGrade,
  assignments,
  assignmentGroups,
  assignmentWeightConsideration
) => {
  const gradedAssignments = assignments
    .filter(gradedOrGoalGradeSetByUser)
  const ungradedAssigmments = assignments
    .filter(notGradedOrGoalGradeSetByUser)

  const currentGrade = calculateMaxGrade(
    gradedAssignments,
    assignmentGroups,
    assignmentWeightConsideration
  )

  const totalGradedAssignmentPoints = calculateTotalPointsPossible(
    gradedAssignments,
    assignmentGroups,
    assignmentWeightConsideration
  )

  const totalUngradedAssignmentPoints = calculateTotalPointsPossible(
    ungradedAssigmments,
    assignmentGroups,
    assignmentWeightConsideration
  )

  const percentageOfCourseUngraded = totalUngradedAssignmentPoints /
    (totalUngradedAssignmentPoints + totalGradedAssignmentPoints)

  const requiredGrade = (goalGrade - ((1 - percentageOfCourseUngraded) * currentGrade)) /
    (percentageOfCourseUngraded * 100)

  return assignments.map(a => {
    if (notGradedOrGoalGradeSetByUser(a) && a.inputBlur) {
      a.goalGrade = roundToXDecimals(requiredGrade * a.pointsPossible, 3) || ''
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
      const assignmentGrade = a.graded && a.pointsPossible !== 0
        ? a.currentUserSubmission.score / a.pointsPossible
        // if user sets assignment goal, use the set goal as part of grade calc.
        : a.goalGradeSetByUser && a.pointsPossible !== 0
          ? a.goalGrade / a.pointsPossible
          // give a perfect score if assignment is not graded to calculate the max grade possible.
          : 1

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
  calculateMaxGrade(
    assignments
      .filter(a => a.graded),
    assignmentGroups,
    assignmentWeightConsideration
  )

const sumAssignmentGoalGrade = assignments => sum(
  assignments.map(a => a.goalGrade || 0)
)

// assignmentGroup.name can be null
const sortByAssignmentGroupName = assignments => assignments.sort((a, b) => {
  return (a.assignmentGroup.name === null && b.assignmentGroup.name === null) ? 0
    : a.assignmentGroup.name ? a.assignmentGroup.name.localeCompare(b.assignmentGroup.name)
      : b.assignmentGroup.name.localeCompare(a.assignmentGroup.name)
})

// name can be null
const sortByAssignmentName = assignments => assignments.sort((a, b) => {
  return (a.name === null && b.name === null) ? 0
    : a.name ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
})

// Sort columns with precedence due date, assignment group name, assignment name
const sortAssignments = assignments => {
  const initialSortedAssignments = sortByAssignmentGroupName(sortByAssignmentName(assignments))

  const assignmentsWithDueDates = initialSortedAssignments
    .filter(a => a.week)
    .sort((a, b) => new Date(a.localDate).getTime() - new Date(b.localDate).getTime())

  const assignmentsWithoutDueDates = initialSortedAssignments
    .filter(a => !a.week)
  return [...assignmentsWithDueDates, ...assignmentsWithoutDueDates]
}

const createAssignmentFields = (
  assignments,
  assignmentGroups,
  courseStartDate,
  assignmentWeightConsideration
) => {
  const totalPointsPossible = calculateTotalPointsPossible(
    assignments,
    assignmentGroups,
    assignmentWeightConsideration
  )
  return sortAssignments(
    assignments.map(a => {
      const {
        localDate,
        pointsPossible,
        assignmentGroupId,
        currentUserSubmission
      } = a

      a.week = calculateWeekOffset(courseStartDate, localDate)
      a.percentOfFinalGrade = roundToXDecimals(
        (
          assignmentWeightConsideration
            ? calculateWeight(pointsPossible, assignmentGroupId, assignmentGroups)
            : pointsPossible / totalPointsPossible * 100
        ), 1
      )
      a.outOf = pointsPossible
      a.graded = !!currentUserSubmission && !!currentUserSubmission.gradedDate
      a.submitted = !!currentUserSubmission && !!currentUserSubmission.submittedAt
      a.dueDateMonthDay = dateToMonthDay(localDate)
      a.goalGrade = ''
      a.goalGradeSetByUser = false
      a.inputFocus = false
      a.inputBlur = true

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

const assignmentStatus = {
  GRADED: 'Graded',
  SUBMITTED: 'Pending Grade',
  UNSUBMITTED: 'Unsubmitted'
}

export {
  assignmentStatus,
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  sumAssignmentGoalGrade,
  createAssignmentFields,
  createUserSettings,
  clearGoals,
  setAssignmentGoalGrade,
  setAssignmentGoalLockState,
  setAssigmentGoalInputState
}
