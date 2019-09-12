import createAssignmentProgressBar from './d3/createAssignmentProgressBar'
import React, { useState } from 'react'
import useResponsiveness from '../hooks/useResponsiveness'
import useCreateChart from '../hooks/useCreateChart'

function AssignmentProgressBar (props) {
  const [domElement, setDomElement] = useState(null)

  const [width, height] = useResponsiveness({ ...props, domElement })
  useCreateChart({ ...props, domElement, width, height }, createAssignmentProgressBar)
  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
}

export default AssignmentProgressBar
