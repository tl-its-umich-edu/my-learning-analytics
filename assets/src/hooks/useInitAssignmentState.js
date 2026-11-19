import { useEffect, useState } from 'react'
import {
  calculateCurrentGrade,
  calculateMaxGrade,
  createAssignmentFields
} from '../util/assignment'
import { loadedWithoutError } from '../util/data'

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
      if (loadedWithoutError(loading, error)) {
        const {
          assignments,
          assignmentGroups,
          dateStart,
          assignmentWeightConsideration,
          currentUserDefaultSelection
        } = data.course
        const enrichedAssignments = createAssignmentFields(
          assignments, assignmentGroups, dateStart, assignmentWeightConsideration
        )
        setAssignments(enrichedAssignments)
        setAssignmentGroups(assignmentGroups)
        setCurrentGrade(
          calculateCurrentGrade(enrichedAssignments, assignmentGroups, assignmentWeightConsideration)
        )
        setMaxPossibleGrade(
          calculateMaxGrade(enrichedAssignments, assignmentGroups, assignmentWeightConsideration)
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
