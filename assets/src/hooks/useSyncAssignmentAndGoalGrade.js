import { useEffect } from 'react'
import {
  calculateAssignmentGoalsFromCourseGoal,
  sumAssignmentGoalGrade
} from '../util/assignment'

const useSyncAssignmentAndGoalGrade = (data, assignments, goalGrade, setAssignments, setUserSetting) => {
  useEffect(() => {
    if (goalGrade) {
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
