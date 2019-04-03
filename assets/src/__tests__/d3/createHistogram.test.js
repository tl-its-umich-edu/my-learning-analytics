/* global describe, test, expect */
import createHistogram from '../../components/d3/createHistogram'
import {histogramData, histogramDataMoreThan100Percent} from '../testData/d3TestData'

describe('createHistogram', () => {
  test('should build a histogram', () => {
    const div = document.createElement('div')
    createHistogram({ data: histogramData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
  test('should build a histogram bar chart with MyGrade line', () => {
    const div = document.createElement('div')
    createHistogram({ data: histogramData, width: 1000, height: 500,  el: div, myGrade:79.8})
    expect(div).toMatchSnapshot()
  })
  test('should build a histogram bar chart with MyGrade line and distribution more than 100', () => {
    const div = document.createElement('div')
    createHistogram({ data: histogramDataMoreThan100Percent, width: 1000, height: 500,  el: div, myGrade:56.8, maxGrade: 110})
    expect(div).toMatchSnapshot()
  })
})
