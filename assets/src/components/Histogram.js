import React, { useState } from 'react'
import createHistogram from './d3/createHistogram'
import useCreateChart from '../hooks/useCreateChart'
import useResponsiveness from '../hooks/useResponsiveness'

function Histogram (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createHistogram)

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default Histogram
