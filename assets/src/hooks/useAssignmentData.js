import { gql, useQuery } from '@apollo/client'

const GET_ASSIGNMENT_PLANNING_DATA = gql`
query Assignment($courseId: ID!) {
  course(canvasId: $courseId) {
    assignments {
      id
      name
      dueDate
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
  return useQuery(GET_ASSIGNMENT_PLANNING_DATA, { variables: { courseId }, fetchPolicy: 'network-only' })
}

export default useAssignmentData
