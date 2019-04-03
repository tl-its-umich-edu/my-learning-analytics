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

const useFetch = (dataURL, options) => {
  const fetchOptions = options
    ? { ...options, ...defaultFetchOptions }
    : { method: 'get', ...defaultFetchOptions }

  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (fetchOptions.method === 'get') {
      // only cache 'get' calls
      if (cache.has(dataURL)) {
        setData(cache.get(dataURL))
        setLoaded(true)
      } else {
        setLoaded(false)
        fetch(dataURL, fetchOptions)
          .then(res => res.json())
          .then(data => {
            cache.set(dataURL, data)
            setData(data)
            setLoaded(true)
          })
      }
    } else {
      fetch(dataURL, fetchOptions)
        .then(res => res.json())
        .then(data => {
          setData(data)
          setLoaded(true)
        })
    }
  }, [dataURL])

  return [loaded, data]
}

export default useFetch
