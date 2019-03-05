import createHorizontalBarChart from './d3/createHorizontalBarChart'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const HorizontalBarChart = compose(
  withResponsiveness,
  createChartComponent
)(createHorizontalBarChart)

export default HorizontalBarChart
