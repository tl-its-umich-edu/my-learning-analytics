import createHorizontalBar from './d3/createHorizontalBar'
import { useState } from 'react'
import useCreateChart from '../hooks/useCreateChart'
import React from 'react'

function HorizontalBar (props) {
  const [domElement, setDomElement] = useState(null)
  useCreateChart({ ...props, domElement }, createHorizontalBar)

  return (
    <div ref={domElement => setDomElement(domElement)}/>
  )

}

export default HorizontalBar
