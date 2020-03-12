import { useEffect, useState } from 'react'
import { createResize } from '../util/chart'

const useResponsiveness = props => {
  const { domElement, aspectRatio = 0.75, minHeight = null } = props
  const [width, setWidth] = useState(null)

  const setContainer = () => {
    if (domElement) {
      setWidth(domElement.getBoundingClientRect().width)
    }
  }

  useEffect(() => {
    setContainer()
    const optimizedResize = createResize()
    optimizedResize.add(() => setContainer())
    return optimizedResize.remove
  })

  const height = (minHeight) && (width * aspectRatio < minHeight)
    ? minHeight
    : (width * aspectRatio)

  return [width, height]
}

export default useResponsiveness
