import React, { useEffect, useState, memo } from 'react'
import { destroyChart } from '../util/chart'

const createChartComponent = chart => memo(props => {
  const { data } = props
  const [el, setEl] = useState(null)

  useEffect(() => {
    if (el && data) {
      chart({ ...props, el, data })
      return () => destroyChart(el)
    }
  })

  return (
    <div ref={el => setEl(el)} />
  )
})

export default createChartComponent
