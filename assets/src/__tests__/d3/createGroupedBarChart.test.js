/* global describe, test, expect */
import createGroupedBarChart from '../../components/d3/createGroupedBarChart'

const groupedBarChartData = Object.freeze(
  [
    {
      'label': 'CA',
      'data': {
        '0-10': 2704659,
        '10-20': 4499890,
        '20-30': 2159981,
        '30-40': 3853788,
        '40-50': 10604510,
        '50-60': 8819342,
        '60-70': 4114496
      }
    },
    {
      'label': 'TX',
      'data': {
        '0-10': 2027307,
        '10-20': 3277946,
        '20-30': 1420518,
        '30-40': 2454721,
        '40-50': 7017731,
        '50-60': 5656528,
        '60-70': 2472223
      }
    },
    {
      'label': 'FL',
      'data': {
        '0-10': 1140516,
        '10-20': 1558919,
        '20-30': 925060,
        '30-40': 2454721,
        '40-50': 4782119,
        '50-60': 4746856,
        '60-70': 3187797
      }
    },
    {
      'label': 'IL',
      'data': {
        '0-10': 894368,
        '10-20': 1558919,
        '20-30': 725973,
        '30-40': 1311479,
        '40-50': 3596343,
        '50-60': 3239173,
        '60-70': 1575308
      }
    },
    {
      'label': 'PA',
      'data': {
        '0-10': 737462,
        '10-20': 1345341,
        '20-30': 679201,
        '30-40': 1203944,
        '40-50': 3157759,
        '50-60': 3414001,
        '60-70': 1910571
      }
    }
  ]
)

describe('createGroupedBarChart', () => {
  test('should build a grouped bar chart', () => {
    const div = document.createElement('div')
    createGroupedBarChart({ data: groupedBarChartData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
