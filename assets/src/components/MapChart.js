import createMapChart from './d3/createMapChart'
import withResponsiveness from '../components/withResponsiveness'
import createChartComponent from '../components/createChartComponent'
import compose from '../util/compose'

const MapChart = compose(
  withResponsiveness,
  createChartComponent
)(createMapChart)

export default MapChart
