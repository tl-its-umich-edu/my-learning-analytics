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
    console.log('useSyncAssignmentAndGoalGrade called ' + new Date())
    console.log(`useSyncAssignmentAndGoalGrade: goalGrade: ${goalGrade} `)
    console.log('useSyncAssignmentAndGoalGrade: assignments.... ')
    console.log(assignments)
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
        assignments: assignmentsSetByUser
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
      console.log('useSyncAssignmentAndGoalGrade: after setAssignments.... ')
      console.log(assignments)
    }, [
      goalGrade,
      assignmentGoalGradeChange,
      assignmentInputBlurChange,
      assignmentCheckboxStateChange
    ])
  }

export default useSyncAssignmentAndGoalGrade
