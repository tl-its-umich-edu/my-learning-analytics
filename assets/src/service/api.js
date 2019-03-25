import useFetch from '../hooks/useFetch'

export const useGradeData = (currentCourseId) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/grade_distribution`)
export const useAssignmentPlanningData = (currentCourseId, assignmentFilter) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=${assignmentFilter}`)
export const useFilesAccessedAssignmentData = (currentCourseId) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=0`)
