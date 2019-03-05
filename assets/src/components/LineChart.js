import createLineChart from './d3/createLineChart'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const LineChart = compose(
  withResponsiveness,
  createChartComponent
)(createLineChart)

export default LineChart
