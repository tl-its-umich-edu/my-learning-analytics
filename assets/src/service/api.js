import useFetch from '../hooks/useFetch'

export const useGradeData = courseId => useFetch(`http://localhost:5001/api/v1/courses/${courseId}/grade_distribution`)
export const useAssignmentPlanningData = (courseId, assignmentFilter) => useFetch(`http://localhost:5001/api/v1/courses/${courseId}/assignments?percent=${assignmentFilter}`)
export const useFilesAccessedAssignmentData = courseId => useFetch(`http://localhost:5001/api/v1/courses/${courseId}/assignments?percent=0`)
export const useCourseInfo = courseId => useFetch(`http://localhost:5001/api/v1/courses/${courseId}/info`)
