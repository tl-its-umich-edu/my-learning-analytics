/* global describe, test, expect */
import createHistogram from '../../components/d3/createHistogram'
import { histogramData, histogramDataMoreThan100Percent,histogramDataWithOutliers,histogramDataWithoutOutliers } from '../testData/d3TestData'

describe('createHistogram', () => {
  test('should build a histogram bar chart with MyGrade line with outliers', () => {
    const div = document.createElement('div')
    createHistogram({
      data: histogramDataWithOutliers,
      width: 1000,
      height: 500,
      domElement: div,
      myGrade: 56.8,
      maxGrade: 100
    })
    expect(div).toMatchSnapshot()
  })
  test('should build a histogram bar chart with MyGrade line with out outliers', () => {
    const div = document.createElement('div')
    createHistogram({
      data: histogramDataWithoutOutliers,
      width: 1000,
      height: 500,
      domElement: div,
      myGrade: 20.8,
      maxGrade: 100
    })
    expect(div).toMatchSnapshot()
  })
})
