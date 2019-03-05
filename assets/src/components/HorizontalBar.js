import createHorizontalBar from './d3/createHorizontalBar'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const HorizontalBar = compose(
  withResponsiveness,
  createChartComponent
)(createHorizontalBar)

export default HorizontalBar
