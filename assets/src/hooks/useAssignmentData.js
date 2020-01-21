import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const GET_ASSIGNMENT_PLANNING_DATA = courseId => gql`
{
  course(canvasId: ${courseId}) {
    assignments {
      id
      name
      localDate
      pointsPossible
      averageGrade
      assignmentGroupId
      currentUserSubmission {
        score
        gradedDate
      }
    }
    dateStart
    assignmentWeightConsideration
    assignmentGroups{
      weight
      id
      groupPoints
      dropLowest
      dropHighest
    }
    currentUserDefaultSelection (defaultViewType: "assignmentv2") {
      defaultViewType,
      defaultViewValue
    }
  }
}
`

const useAssignmentData = courseId => {
  return useQuery(GET_ASSIGNMENT_PLANNING_DATA(courseId))
}

export default useAssignmentData
