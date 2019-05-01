import React, { useState } from 'React'
import createHorizontalBarChart from './d3/createHorizontalBarChart'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function HorizontalBarChart (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createHorizontalBarChart)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default HorizontalBarChart
