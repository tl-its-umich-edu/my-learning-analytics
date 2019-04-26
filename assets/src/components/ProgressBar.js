import createProgressBar from './d3/createProgressBar'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const ProgressBar = compose(
  withResponsiveness,
  createChartComponent
)(createProgressBar)

export default ProgressBar
