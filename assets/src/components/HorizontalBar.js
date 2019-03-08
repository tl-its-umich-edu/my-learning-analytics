import createHorizontalBar from './d3/createHorizontalBar'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const HorizontalBar = compose(
  createChartComponent
)(createHorizontalBar)

export default HorizontalBar
