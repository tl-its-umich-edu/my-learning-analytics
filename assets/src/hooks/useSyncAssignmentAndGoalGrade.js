import { useEffect } from 'react'
import { calculateAssignmentGoalsFromCourseGoal, sumAssignmentGoalGrade } from '../util/assignment'

// this effect is used to keep the goal of the course and assignments "in sync"
// run if goalGrade changes, or if the sum of goal grades set by user changes
const useSyncAssignmentAndGoalGrade =
  ({
    data,
    assignments,
    goalGrade,
    setAssignments,
    setUserSetting,
    eventLog
  }) => {
    const assignmentInputBlurChange = assignments
      .map(a => a.inputBlur).every(Boolean)

    const assignmentCheckboxStateChange = assignments
      .map(a => a.goalGradeSetByUser).filter(Boolean).length

    const assignmentGoalGradeChange = sumAssignmentGoalGrade(assignments)

    useEffect(() => {
      const assignmentsSetByUser = assignments
        .filter(a => a.goalGradeSetByUser)
        .map(({ id, goalGradeSetByUser, goalGrade }) => (
          {
            assignmentId: id,
            goalGradeSetByUser,
            goalGrade
          }
        ))

      const userSetting = () => {
        const setting = {
          goalGrade,
          assignments: assignmentsSetByUser,
          event: eventLog.eLog
        }
        return setting
      }

      setUserSetting(userSetting)

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
