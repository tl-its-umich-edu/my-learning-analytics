import createSankeyDiagram from './d3/createSankeyDiagram'
import withResponsiveness from './withResponsiveness'
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const Sankey = compose(
  withResponsiveness,
  createChartComponent
)(createSankeyDiagram)

export default Sankey
