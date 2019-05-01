import React, { useState, useEffect } from 'react'
import { createResize } from '../util/chart'

const withResponsiveness = ChartComponent => props => {
  const { aspectRatio = 0.75 } = props
  const minimumWidth = 400
  const [domElement, setDomElement] = useState(null)
  const [width, setWidth] = useState(null)

  const setContainer = domElement => {
    if (domElement) {
      setDomElement(domElement)
      setWidth(domElement.getBoundingClientRect().width > minimumWidth
        ? domElement.getBoundingClientRect().width
        : minimumWidth)
    }
  }

  useEffect(() => {
    const optimizedResize = createResize()
    optimizedResize.add(() => setContainer(domElement))
    return optimizedResize.remove
  })

  const notNull = (width !== null)

  return (
    <div ref={domElement => setContainer(domElement)}>
      {notNull && <ChartComponent width={width} height={width * aspectRatio} {...props} /> }
    </div>
  )
}

export default withResponsiveness
