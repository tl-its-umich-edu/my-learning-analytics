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
      console.log(`UseInit Call ${loading}`)
      if (loadedWithoutError(loading, error)) {
        console.log(`UseInit Call inside condition ${loading} ${new Date()}`)
        const {
          assignments,
          assignmentGroups,
          dateStart,
          assignmentWeightConsideration,
          currentUserDefaultSelection
        } = data.course
        console.log('UseInit: assignment ( not from Effects) Before .....')
        console.log(assignments)
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
        console.log('UseInit: assignment ( not from Effects) After .....')
        console.log(assignments)
      }
    }, [loading])

    return [assignmentGroups, currentGrade, maxPossibleGrade]
  }

export default useInitAssignmentState
