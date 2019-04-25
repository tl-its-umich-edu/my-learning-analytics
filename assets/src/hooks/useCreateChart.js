import { useEffect } from 'react'
import { destroyChart } from '../util/chart'

const useCreateChart = (props, chart) => {
  const { el, data, width } = props

  useEffect(() => {
    if (el && data && width) {
      chart({ ...props, el, data })
      return () => destroyChart(el)
    }
  })
}

export default useCreateChart
