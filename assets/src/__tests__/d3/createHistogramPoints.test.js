import createHistogram from '../../components/d3/createHistogram'
import { histogramData } from '../testData/d3TestDataPoints'

describe('createHistogram', () => {
  test('should build a histogram bar chart using points data and correctly show points and not percentages', () => {
    const div = document.createElement('div')
    createHistogram({
      data: histogramData,
      gradingType: 'PT',
      width: 1000,
      height: 500,
      domElement: div,
      myGrade: 195.4,
      maxGrade: 279.3,
      showNumberOnBars: false
    })
    expect(div).toMatchSnapshot()
  })

})
