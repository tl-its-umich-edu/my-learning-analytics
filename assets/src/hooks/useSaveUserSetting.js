import { useEffect } from 'react'
import useSetUserSettingGQL from './useSetUserSettingGQL'
import isEqual from 'lodash.isequal'
import { createUserSettings } from '../util/assignment'

const useSaveUserSetting = (loading, error, courseId, userSetting, data) => {
  const { debouncedUpdateUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  useEffect(() => {
    if (!loading && !error) {
      const defaultViewValue = JSON.parse(data.course.currentUserDefaultSelection.defaultViewValue)
      if (!isEqual(userSetting, defaultViewValue)) {
        debouncedUpdateUserSetting(
          createUserSettings(courseId, 'assignment', userSetting)
        )
      }
    }
  }, [JSON.stringify(userSetting)])

  return [mutationLoading, mutationError]
}

export default useSaveUserSetting
