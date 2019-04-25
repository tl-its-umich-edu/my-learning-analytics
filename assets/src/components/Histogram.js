import React, { useState } from 'react'
import createHistogram from './d3/createHistogram'
import useChart from '../hooks/useChart'
import useResponsiveness from '../hooks/useResponsiveness'

function Histogram (props) {
  const [el, setEl] = useState(null)

  const [width, height] = useResponsiveness({ ...props, el })
  useChart({ ...props, el, width, height }, createHistogram)

  return (
    <div ref={el => setEl(el)} />
  )
}

export default Histogram
