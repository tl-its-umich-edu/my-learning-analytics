import React, { useState } from 'react'
import createBarChart from './d3/createBarChart'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function BarChart (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createBarChart)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default BarChart
