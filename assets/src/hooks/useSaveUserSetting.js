import { useEffect } from 'react'
import useSetUserSettingGQL from './useSetUserSettingGQL'
import isEqual from 'lodash.isequal'
import { createUserSettings } from '../util/assignment'

const useSaveUserSetting = (loading, error, courseId, userSetting, data) => {
  const { debouncedUpdateUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  useEffect(() => {
    if (!loading && !error) {
      if (!data.course.currentUserDefaultSelection) {
        debouncedUpdateUserSetting(
          createUserSettings(courseId, 'assignmentv2', userSetting)
        )
      } else if (!isEqual(userSetting, JSON.parse(data.course.currentUserDefaultSelection.defaultViewValue))) {
        debouncedUpdateUserSetting(
          createUserSettings(courseId, 'assignmentv2', userSetting)
        )
      }
    }
  }, [JSON.stringify(userSetting)])

  return [mutationLoading, mutationError]
}

export default useSaveUserSetting
