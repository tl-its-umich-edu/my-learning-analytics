import { useEffect } from 'react'
import { calculateAssignmentGoalsFromCourseGoal, sumAssignmentGoalGrade } from '../util/assignment'
import { roundToXDecimals } from '../util/math'

// this effect is used to keep the goal of the course and assignments "in sync"
// run if goalGrade changes, or if the sum of goal grades set by user changes
const useSyncAssignmentAndGoalGrade =
  ({
    data,
    assignments,
    goalGrade,
    goalGradePrev,
    currentGrade,
    maxPossibleGrade,
    setAssignments,
    setUserSetting
  }) => {
    const assignmentInputBlurChange = assignments
      .map(a => a.inputBlur).every(Boolean)

    const assignmentCheckboxStateChange = assignments
      .map(a => a.goalGradeSetByUser).filter(Boolean).length

    const assignmentGoalGradeChange = sumAssignmentGoalGrade(assignments)

    useEffect(() => {
      const assignmentsSetByUser = assignments
        .filter(a => a.goalGradeSetByUser)
        .map(({ id, goalGradeSetByUser, goalGrade, goalGradePrev }) => (
          {
            assignmentId: id,
            goalGradeSetByUser,
            goalGrade,
            goalGradePrev
          }
        ))

      setUserSetting({
        goalGrade,
        goalGradePrev: goalGrade === '' ? '' : roundToXDecimals(goalGradePrev, 1),
        currentGrade: goalGrade === '' ? '' : roundToXDecimals(currentGrade, 1),
        maxPossible: goalGrade === '' ? '' : roundToXDecimals(maxPossibleGrade, 1),
        assignments: goalGrade === '' ? [] : assignmentsSetByUser
      })

      if (goalGrade !== '') {
        setAssignments(
          calculateAssignmentGoalsFromCourseGoal(
            goalGrade,
            assignments,
            data.course.assignmentGroups,
            data.course.assignmentWeightConsideration
          )
        )
      }
    }, [
      goalGrade,
      assignmentGoalGradeChange,
      assignmentInputBlurChange,
      assignmentCheckboxStateChange
    ])
  }

export default useSyncAssignmentAndGoalGrade
