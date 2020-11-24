import { useEffect } from 'react'
import { loadedWithoutError } from '../util/data'

// this effect runs exactly once, if there is a previously saved user setting
const useUserAssignmentSetting =
  ({
    loading,
    error,
    assignments,
    userSetting,
    setGoalGrade,
    setAssignments,
    currentGrade,
    maxPossibleGrade
  }) => {
    useEffect(() => {
      if (loadedWithoutError(loading, error)) {
        if (userSetting) {
          setGoalGrade(
            typeof userSetting.goalGrade === 'undefined'
              ? ''
              : userSetting.goalGrade
          )
          userSetting.currentGrade = currentGrade
          userSetting.maxPossibleGrade = maxPossibleGrade
          if (userSetting.assignments) {
            const assignmentsWithUserSetting = assignments.map(a => {
              const assignmentSetting = userSetting.assignments
                .find(x => x.assignmentId === a.id)
              if (assignmentSetting) {
                a.goalGrade = assignmentSetting.goalGrade
                a.goalGradeSetByUser = assignmentSetting.goalGradeSetByUser
                a.goalGradePrev = assignmentSetting.goalGradePrev
              }
              return a
            })
            setAssignments(assignmentsWithUserSetting)
          }
        }
      }
    }, [JSON.stringify(userSetting)])
  }

export default useUserAssignmentSetting
