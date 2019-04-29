import React, { useEffect, useState, memo } from 'react'
import { destroyChart } from '../util/chart'

const createChartComponent = chart => memo(props => {
  const { data } = props
  const [domElement, setDomElement] = useState(null)

  useEffect(() => {
    if (el && data) {
      chart({ ...props, el, data })
      return () => destroyChart(el)
    }
  })

  return (
    <div ref={domElement => setDomElement(domElement)} />
  )
})

export default createChartComponent
