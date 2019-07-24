/* global fetch */
import { useState, useEffect } from 'react'
import Cookie from 'js-cookie'

const useSetUserSetting = (courseId, userSetting) => {
  useEffect(() => {
    if (settingChanged) {
      fetch(`/api/v1/courses/${courseId}/set_user_default_selection`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': Cookie.get('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify(userSetting),
        method: 'PUT'
      })
    }
  }, [userSetting])
}

export default useSetUserSetting
