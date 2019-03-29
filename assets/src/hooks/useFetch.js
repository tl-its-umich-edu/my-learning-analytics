/* global fetch */
import { useState, useEffect } from 'react'

const cache = new Map()
// https://sudo.isl.co/fetch-me-that-json-from-django/
const get = url => {
  return fetch(url,{
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'include'
  })
    .then(res => res.json())
}

const useFetch = dataURL => {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (cache.has(dataURL)) {
      setData(cache.get(dataURL))
      setLoaded(true)
    } else {
      setLoaded(false)
      get(dataURL).then(data => {
        cache.set(dataURL, data)
        setData(data)
        setLoaded(true)
      })
    }
  }, [dataURL])

  return [loaded, data]
}

export default useFetch
