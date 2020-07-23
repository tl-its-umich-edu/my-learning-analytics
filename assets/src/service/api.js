import useFetch from '../hooks/useFetch'

export const useGradeData = courseId =>
  useFetch(`/api/v1/courses/${courseId}/grade_distribution`)
export const useAssignmentData = (courseId, assignmentGradeFilter, doNotFetch) => {
  return useFetch(`/api/v1/courses/${courseId}/assignments?percent=${assignmentGradeFilter}`, false, doNotFetch)
}
export const useCourseInfo = courseId =>
  useFetch(`/api/v1/courses/${courseId}/info`)
export const useUserSettingData = (courseId, type) =>
  useFetch(`/api/v1/courses/${courseId}/get_user_default_selection?default_type=${type}`)
