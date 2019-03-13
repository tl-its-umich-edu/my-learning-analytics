/* global describe, test, expect */
import createHorizontalBarChart from '../../components/d3/createHorizontalBarChart'

const horizontalBarChartData = Object.freeze(
  [
    {
      'label': 'Ethiopia',
      'data': 1
    },
    {
      'label': 'Japan',
      'data': 3
    },
    {
      'label': 'Sweden',
      'data': 10
    },
    {
      'label': 'Canada',
      'data': 38
    },
    {
      'label': 'China',
      'data': 7
    },
    {
      'label': 'France',
      'data': 4
    },
    {
      'label': 'South Korea',
      'data': 9
    }
  ]
)

describe('createHorizontalBarChart', () => {
  test('should build a horizontal bar chart', () => {
    const div = document.createElement('div')
    createHorizontalBarChart({ data: horizontalBarChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
