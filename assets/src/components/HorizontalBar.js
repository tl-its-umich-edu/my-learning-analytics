import createHorizontalBar from './d3/createHorizontalBar'
import React, { useState } from 'react'
import useCreateChart from '../hooks/useCreateChart'

function HorizontalBar (props) {
  const [domElement, setDomElement] = useState(null)
  useCreateChart({ ...props, domElement }, createHorizontalBar)

  return (
    <div ref={domElement => setDomElement(domElement)}/>
  )

}

export default HorizontalBar
