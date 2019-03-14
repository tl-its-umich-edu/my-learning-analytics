/* global describe, test, expect */
import createBarChart from '../../components/d3/createBarChart'

const barChartData = Object.freeze(
  [
    {
      'label': 'Bob',
      'data': 12
    },
    {
      'label': 'Robin',
      'data': 34
    },
    {
      'label': 'Anne',
      'data': 78
    },
    {
      'label': 'Mark',
      'data': 23
    },
    {
      'label': 'Joe',
      'data': 10
    },
    {
      'label': 'Eve',
      'data': 44
    },
    {
      'label': 'Karen',
      'data': 4
    }
  ]
)

describe('createBarChart', () => {
  test('should build a bar chart', () => {
    const div = document.createElement('div')
    createBarChart({ data: barChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
