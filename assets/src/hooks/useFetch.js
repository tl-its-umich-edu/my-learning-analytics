import { useState, useEffect } from 'react'
import get from '../service/api'

const cache = new Map()

const useFetch = dataURL => {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (cache.has(dataURL)) {
      setData(cache.get(dataURL))
    } else {
      get(dataURL).then(data => {
        cache.set(dataURL, data)
        setData(data)
      })
    }
  }, [dataURL])

  return data
}

export default useFetch
