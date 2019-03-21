import createFileAccessChart from './d3/createFileAccessChart';
import withResponsiveness from './withResponsiveness';
import createChartComponent from './createChartComponent'
import compose from '../util/compose'

const FileAccessChart = compose(
    withResponsiveness,
    createChartComponent
  )(createFileAccessChart)
  
  export default FileAccessChart