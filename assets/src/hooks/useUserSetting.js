/* global fetch */
import { useState, useEffect } from 'react'
import { handleError } from '../util/data'
import Cookie from 'js-cookie'

const useUserSetting = (courseId, view, conditionalArray = []) => {
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`/api/v1/courses/${courseId}/get_user_default_selection?default_type=${view}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': Cookie.get('csrftoken')
      },
      credentials: 'include'
    }).then(handleError)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoaded(true)
      })
  }, conditionalArray) // the empty array passed as second arg to useEffect ensures this effect only runs once

  return [loaded, data]
}

export default useUserSetting
