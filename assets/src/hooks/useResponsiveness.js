import { useEffect, useState } from 'react'
import { createResize } from '../util/chart'

const useResponsiveness = props => {
  const { domElement, aspectRatio = 0.75 } = props
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

  return [width, width * aspectRatio]
}

export default useResponsiveness
