import useFetch from '../hooks/useFetch'

export const useGradeData = (currentCourseId) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/grade_distribution`)
export const useAssignmentPlanningData = (currentCourseId, assignmentFilter) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=${assignmentFilter}`)
export const useFilesAccessedData = (currentCourseId, startWeek, endWeek, gradeRange) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/file_access_within_week?week_num_start=${startWeek}&week_num_end=${endWeek}&grade=${gradeRange}`)
export const useCourseInfo = (currentCourseId) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/info`)
export const useUserSettingData = (currentCourseId) => useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/get_user_default_selection?default_type=file`)
