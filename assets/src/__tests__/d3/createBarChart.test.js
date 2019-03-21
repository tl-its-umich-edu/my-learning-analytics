/* global describe, test, expect */
import createBarChart from '../../components/d3/createBarChart'
import { barChartData } from '../testData/d3TestData'

describe('createBarChart', () => {
  test('should build a bar chart', () => {
    const div = document.createElement('div')
    createBarChart({ data: barChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
