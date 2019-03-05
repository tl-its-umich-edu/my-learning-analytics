import createGroupedBarChart from './d3/createGroupedBarChart'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const GroupedBarChart = compose(
  withResponsiveness,
  createChartComponent
)(createGroupedBarChart)

export default GroupedBarChart
