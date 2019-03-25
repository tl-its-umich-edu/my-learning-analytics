/* global describe, test, expect */
import createHorizontalBarChart from '../../components/d3/createHorizontalBarChart'
import { horizontalBarChartData } from '../testData/d3TestData'

describe('createHorizontalBarChart', () => {
  test('should build a horizontal bar chart', () => {
    const div = document.createElement('div')
    createHorizontalBarChart({ data: horizontalBarChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
