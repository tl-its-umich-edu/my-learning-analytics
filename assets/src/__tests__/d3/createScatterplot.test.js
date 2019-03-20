/* global describe, test, expect */
import createScatterplot from '../../components/d3/createScatterplot'

const scatterplotData = Object.freeze(
  [
    {
      'x': 10,
      'y': 10
    },
    {
      'x': 10,
      'y': 11
    },
    {
      'x': 11,
      'y': 10
    },
    {
      'x': 30,
      'y': 30
    },
    {
      'x': 70,
      'y': 66
    },
    {
      'x': 90,
      'y': 90
    },
    {
      'x': 100,
      'y': 89
    },
    {
      'x': 40,
      'y': 77
    },
    {
      'x': 60,
      'y': 69
    }
  ]
)

describe('createScatterplot', () => {
  test('should build a scatter plot', () => {
    const div = document.createElement('div')
    createScatterplot({ data: scatterplotData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
