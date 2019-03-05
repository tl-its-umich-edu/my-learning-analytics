import createDonutChart from './d3/createDonutChart'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const DonutChart = compose(
  withResponsiveness,
  createChartComponent
)(createDonutChart)

export default DonutChart
