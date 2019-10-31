import { useEffect } from 'react'
import {
  calculateCurrentGrade,
  calculateMaxGrade,
  createAssignmentFields
} from '../util/assignment'

// initialize the state
const useInitAssignmentState =
  (
    loading,
    error,
    data,
    setAssignments,
    setCurrentGrade,
    setMaxPossibleGrade,
    setUserSetting
  ) => {
    useEffect(() => {
      if (!loading && !error) {
        const {
          assignments,
          assignmentGroups,
          dateStart,
          assignmentWeightConsideration,
          currentUserDefaultSelection
        } = data.course
        setAssignments(
          createAssignmentFields(assignments, assignmentGroups, dateStart)
        )
        setCurrentGrade(
          calculateCurrentGrade(assignments, assignmentGroups, assignmentWeightConsideration)
        )
        setMaxPossibleGrade(
          calculateMaxGrade(assignments, assignmentGroups, assignmentWeightConsideration)
        )
        setUserSetting(
          currentUserDefaultSelection
            ? JSON.parse(currentUserDefaultSelection.defaultViewValue)
            : {}
        )
      }
    }, [loading])
  }

export default useInitAssignmentState
