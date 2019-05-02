import { useEffect } from 'react'
import { destroyChart } from '../util/chart'

const useCreateChart = (props, chart) => {
  const { domElement, data, width } = props

  useEffect(() => {
    if (domElement && data && width) {
      chart({ ...props, domElement, data })
      return () => destroyChart(domElement)
    }
  })
}

export default useCreateChart
