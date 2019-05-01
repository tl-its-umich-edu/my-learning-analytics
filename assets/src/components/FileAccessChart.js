import createFileAccessChart from './d3/createFileAccessChart'
import React, { useState } from 'react'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function FileAccessChart (props) {
  const [domElement, setDomElement] = useState(null)
  console.log(props)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createFileAccessChart)

  return (
    <div ref={domElement => setDomElement(domElement)}/>
  )
}

export default FileAccessChart