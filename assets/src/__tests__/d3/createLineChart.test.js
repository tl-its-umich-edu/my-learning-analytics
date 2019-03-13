/* global describe, test, expect */
import createLineChart from '../../components/d3/createLineChart'

const lineChartData = Object.freeze(
  [
    {
      'label': 0,
      'data': 0
    },
    {
      'label': 1,
      'data': 1
    },
    {
      'label': 2,
      'data': 2
    },
    {
      'label': 3,
      'data': 2
    },
    {
      'label': 4,
      'data': 3
    }
  ]
)

describe('createLineChart', () => {
  test('should build a line chart', () => {
    const div = document.createElement('div')
    createLineChart({ data: lineChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
