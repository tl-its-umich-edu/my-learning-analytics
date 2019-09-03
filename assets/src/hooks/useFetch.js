/* global fetch */
import { useState, useEffect } from 'react'
import { handleError, defaultFetchOptions } from '../util/data'

const cache = new Map()

const useFetch = (dataURL, options, doNotFetch = false) => {
  const fetchOptions = options
    ? { ...options, ...defaultFetchOptions }
    : { method: 'get', ...defaultFetchOptions }

  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // doNotFetch is used in AssignmentPlanning to ensure data is fetched after user setting is loaded
    if (doNotFetch) return
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
      setLoaded(false)
      fetch(dataURL, fetchOptions)
        .then(handleError)
        .then(res => res.json())
        .then(data => {
          setData(data)
          setLoaded(true)
        })
        .catch(error => setError(error.message))
    }
  }, [dataURL, fetchOptions.body])

  return [loaded, error, data]
}

export default useFetch
