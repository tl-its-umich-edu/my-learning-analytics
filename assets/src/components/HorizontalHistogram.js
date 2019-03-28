import createHorizontalHistogram from './d3/createHorizontalHistogram';
import withResponsiveness from './withResponsiveness';
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const HorizontalHistogram = compose(
    withResponsiveness,
    createChartComponent
  )(createHorizontalHistogram)
  
  export default HorizontalHistogram