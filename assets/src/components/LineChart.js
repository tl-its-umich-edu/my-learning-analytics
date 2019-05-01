import React, { useState } from 'react'
import createLineChart from './d3/createLineChart'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function LineChart (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createLineChart)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default LineChart
