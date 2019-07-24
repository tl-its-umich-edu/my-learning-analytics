import useFetch from '../hooks/useFetch'
import { defaultFetchOptions } from '../util/data'

export const useGradeData = (currentCourseId) =>
  useFetch(`/api/v1/courses/${currentCourseId}/grade_distribution`)
export const useCourseInfo = (currentCourseId) =>
  useFetch(`/api/v1/courses/${currentCourseId}/info`)
export const useUserSettingData = (currentCourseId, type) =>
  useFetch(`/api/v1/courses/${currentCourseId}/get_user_default_selection?default_type=${type}`)

export const useSaveSetting = (currentCourseId, userOptions, settingChanged) => {
  const fetchOptions = {
    ...defaultFetchOptions,
    body: JSON.stringify(userOptions),
    method: 'PUT'
  }
  const dataURL = `/api/v1/courses/${currentCourseId}/set_user_default_selection`
  return useFetch(dataURL, fetchOptions)
}
