/* global describe, test, expect */
import createHistogram from '../../components/d3/createHistogram'

const histogramData = Object.freeze(
  [
    34,
    35,
    40,
    55,
    60,
    61,
    75,
    83,
    92,
    97,
    100
  ]
)

describe('createHistogram', () => {
  test('should build a histogram', () => {
    const div = document.createElement('div')
    createHistogram({ data: histogramData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
