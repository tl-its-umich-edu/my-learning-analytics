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
    setUserSetting
  }) => {
    useEffect(() => {
      if (goalGrade !== '') {
        setAssignments(
          calculateAssignmentGoalsFromCourseGoal(
            goalGrade,
            assignments,
            data.course.assignmentGroups,
            data.course.assignmentWeightConsideration
          )
        )
        const assignmentsSetByUser = assignments
          .filter(a => a.goalGradeSetByUser)
          .map(({ id, goalGradeSetByUser, goalGrade }) => (
            {
              assignmentId: id,
              goalGradeSetByUser,
              goalGrade
            }
          ))
        setUserSetting({
          goalGrade,
          assignments: assignmentsSetByUser
        })
      }
    }, [goalGrade, sumAssignmentGoalGrade(assignments)])
  }

export default useSyncAssignmentAndGoalGrade
