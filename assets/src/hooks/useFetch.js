/* global fetch */
import { useState, useEffect } from 'react'

const cache = new Map()

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
}

const handleError = res => {
  if (!res.ok) throw Error(res.statusText)
  return res
}

const useFetch = (dataURL, options) => {
  const fetchOptions = options
    ? { ...options, ...defaultFetchOptions }
    : { method: 'get', ...defaultFetchOptions }

  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (fetchOptions.method === 'get') {
      // only cache 'get' calls
      if (cache.has(dataURL)) {
        setData(cache.get(dataURL))
        setLoaded(true)
      } else {
        setLoaded(false)
        fetch(dataURL, fetchOptions)
          .then(handleError)
          .then(res => res.json())
          .then(data => {
            cache.set(dataURL, data)
            setData(data)
            setLoaded(true)
          })
          .catch(error => setError(error))
      }
    } else {
      fetch(dataURL, fetchOptions)
        .then(handleError)
        .then(res => res.json())
        .then(data => {
          setData(data)
          setLoaded(true)
        })
        .catch(error => setError(error.message))
    }
  }, [dataURL])

  return [loaded, error, data]
}

export default useFetch
