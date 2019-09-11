/* global describe, test, expect */
import createHistogram from '../../components/d3/createHistogram'
import { histogramData, histogramDataMoreThan100Percent,histogramDataWithBinning,histogramDataWithoutOutliers } from '../testData/d3TestData'

describe('createHistogram', () => {
  test('should build a histogram bar chart with MyGrade line with outliers', () => {
    const div = document.createElement('div')
    createHistogram({
      data: histogramDataWithBinning,
      width: 1000,
      height: 500,
      domElement: div,
      myGrade: 76.8,
      maxGrade: 100
    })
    expect(div).toMatchSnapshot()
  })

})
