/* global describe, test, expect */
import createGroupedBarChart from '../../components/d3/createGroupedBarChart'
import { groupedBarChartData } from '../testData/d3TestData'

describe('createGroupedBarChart', () => {
  test('should build a grouped bar chart', () => {
    const div = document.createElement('div')
    createGroupedBarChart({ data: groupedBarChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
