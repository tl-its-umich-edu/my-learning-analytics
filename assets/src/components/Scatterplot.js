import createScatterplot from './d3/createScatterplot'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const Scatterplot = compose(
  withResponsiveness,
  createChartComponent
)(createScatterplot)

export default Scatterplot
