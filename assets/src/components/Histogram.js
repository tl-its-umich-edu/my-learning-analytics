import createHistogram from './d3/createHistogram'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const Histogram = compose(
  withResponsiveness,
  createChartComponent
)(createHistogram)

export default Histogram
