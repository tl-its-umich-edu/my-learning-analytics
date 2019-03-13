import { useState, useEffect } from 'react'
import get from '../service/api'

const cache = new Map()

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
