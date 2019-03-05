import createBarChart from './d3/createBarChart'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const BarChart = compose(
  withResponsiveness,
  createChartComponent
)(createBarChart)

export default BarChart
