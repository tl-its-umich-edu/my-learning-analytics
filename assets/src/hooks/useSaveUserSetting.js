import { useEffect } from 'react'
import useSetUserSettingGQL from './useSetUserSettingGQL'
import isEqual from 'lodash.isequal'
import { createUserSettings } from '../util/assignment'
import { loadedWithoutError } from '../util/data'

const userSettingChanged = (userSetting, data) => {
  return !isEqual(
    userSetting,
    JSON.parse(data.course.currentUserDefaultSelection.defaultViewValue)
  )
}

const useSaveUserSetting = ({ loading, error, courseId, userSetting, data }) => {
  const { debouncedUpdateUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  useEffect(() => {
    if (loadedWithoutError(loading, error)) {
      if (!data.course.currentUserDefaultSelection) {
        debouncedUpdateUserSetting(
          createUserSettings(courseId, 'assignmentv2', userSetting)
        )
      } else if (userSettingChanged(userSetting, data)) {
        debouncedUpdateUserSetting(
          createUserSettings(courseId, 'assignmentv2', userSetting)
        )
      }
    }
  }, [JSON.stringify(userSetting)])

  return [mutationLoading, mutationError]
}

export default useSaveUserSetting
