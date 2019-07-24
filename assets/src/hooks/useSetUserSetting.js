/* global fetch */
import { useState, useEffect } from 'react'
import { handleError } from '../util/data'
import Cookie from 'js-cookie'

const useSetUserSetting = (courseId, userSetting, settingChanged) => {
  const [loaded, setLoaded] = useState(false)
  const [response, setResponse] = useState(null)

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
      }).then(handleError)
        .then(res => res.json())
        .then(res => {
          setResponse(res)
          setLoaded(true)
        })
    }
  }, [userSetting])

  return [loaded, response]
}

export default useSetUserSetting
