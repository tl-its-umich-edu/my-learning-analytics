import useFetch from '../hooks/useFetch'

export const useGradeData = (currentCourseId) => useFetch(`/api/v1/courses/${currentCourseId}/grade_distribution`)
export const useCourseInfo = (currentCourseId) => useFetch(`/api/v1/courses/${currentCourseId}/info`)
export const useUserSettingData = (currentCourseId, type) => useFetch(`/api/v1/courses/${currentCourseId}/get_user_default_selection?default_type=${type}`)
