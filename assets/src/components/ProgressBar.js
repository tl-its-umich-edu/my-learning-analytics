import createProgressBar from './d3/createProgressBar'
import React, { useState } from 'react'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function ProgressBar (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createProgressBar)
  return (
    <div ref={domElement => setDomElement(domElement)}/>
  )
}

export default ProgressBar
