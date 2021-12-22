import { useEffect, useRef } from 'react'
import useSetUserSettingGQL from './useSetUserSettingGQL'
import { createUserSettings } from '../util/assignment'
import { loadedWithoutError } from '../util/data'
import debounce from 'lodash.debounce'

const useSaveUserSetting = ({ loading, error, courseId, userSetting, settingChanged }) => {
  const { saveUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  const debouncedSave = useRef(debounce(userSetting => saveUserSetting(userSetting), 1000)).current

  useEffect(() => {
    if (loadedWithoutError(loading, error) && settingChanged) {
      debouncedSave(
        createUserSettings(courseId, 'assignment', userSetting)
      )
    }
  }, [JSON.stringify(userSetting)])

  return [mutationLoading, mutationError]
}

export default useSaveUserSetting
