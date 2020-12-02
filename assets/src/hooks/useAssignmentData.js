import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'

const GET_ASSIGNMENT_PLANNING_DATA = courseId => gql`
query Assignment{
  course(canvasId: ${courseId}) {
    assignments {
      id
      name
      localDate
      pointsPossible
      averageGrade
      assignmentGroupId
      assignmentGroup{
        name
      }
      currentUserSubmission {
        score
        gradedDate
        submittedAt
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
    currentUserDefaultSelection (defaultViewType: "assignment") {
      defaultViewType,
      defaultViewValue
    }
  }
}
`

const useAssignmentData = courseId => {
  return useQuery(GET_ASSIGNMENT_PLANNING_DATA(courseId), { variables: { courseId }, fetchPolicy: 'network-only' })
}

export default useAssignmentData
