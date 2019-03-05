import React, { useState, useEffect } from 'react'
import { createResize } from '../util/chart'

const withResponsiveness = ChartComponent => props => {
  const { aspectRatio = 0.75 } = props

  const [el, setEl] = useState(null)
  const [width, setWidth] = useState(null)

  const setContainer = el => {
    if (el) {
      setEl(el)
      setWidth(el.getBoundingClientRect().width)
    }
  }

  useEffect(() => {
    const optimizedResize = createResize()
    optimizedResize.add(() => setContainer(el))
    return optimizedResize.remove
  })

  const notNull = (width !== null)

  return (
    <div ref={el => setContainer(el)}>
      {notNull && <ChartComponent width={width} height={width * aspectRatio} {...props} /> }
    </div>
  )
}

export default withResponsiveness
