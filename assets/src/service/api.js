import useFetch from '../hooks/useFetch'

export const useGradeData = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/grade_distribution`)
export const useAssignmentPlanningData = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=${assignmentFilter}`)
export const useFilesAccessedAssignmentData = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=0`)
