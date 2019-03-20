/* global describe, test, expect */
import createHistogram from '../../components/d3/createHistogram'
import { histogramData } from '../testData/d3TestData'

describe('createHistogram', () => {
  test('should build a histogram', () => {
    const div = document.createElement('div')
    createHistogram({ data: histogramData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
