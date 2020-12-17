import { useEffect } from 'react'
import useSetUserSettingGQL from './useSetUserSettingGQL'
import { createUserSettings } from '../util/assignment'
import { loadedWithoutError } from '../util/data'

const useSaveUserSetting = ({ loading, error, courseId, userSetting, settingChanged }) => {
  const { saveUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  useEffect(() => {
    if (loadedWithoutError(loading, error) && settingChanged) {
      saveUserSetting(
        createUserSettings(courseId, 'assignment', userSetting)
      )
    }
  }, [JSON.stringify(userSetting)])

  return [mutationLoading, mutationError]
}

export default useSaveUserSetting
