import createResourceAccessChart from './d3/createResourceAccessChart'
import React, { useState } from 'react'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function ResourceAccessChart (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createResourceAccessChart)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default ResourceAccessChart
