import React, { useState } from 'react'
import createGroupedBarChart from './d3/createGroupedBarChart'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function GroupedBarChart (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createGroupedBarChart)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default GroupedBarChart
