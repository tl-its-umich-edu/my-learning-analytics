import { useEffect, useState } from 'react'
import {
  calculateCurrentGrade,
  calculateMaxGrade,
  createAssignmentFields
} from '../util/assignment'

// initialize the state
const useInitAssignmentState =
  ({
    loading,
    error,
    data,
    setAssignments,
    setUserSetting
  }) => {
    const [assignmentGroups, setAssignmentGroups] = useState([])
    const [currentGrade, setCurrentGrade] = useState(0)
    const [maxPossibleGrade, setMaxPossibleGrade] = useState(0)

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
          createAssignmentFields(assignments, assignmentGroups, dateStart, assignmentWeightConsideration)
        )
        setAssignmentGroups(assignmentGroups)
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

    return [assignmentGroups, currentGrade, maxPossibleGrade]
  }

export default useInitAssignmentState
