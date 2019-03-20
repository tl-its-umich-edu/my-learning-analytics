/* global describe, test, expect */
import createScatterplot from '../../components/d3/createScatterplot'
import { scatterplotData } from '../testData/d3TestData'

describe('createScatterplot', () => {
  test('should build a scatter plot', () => {
    const div = document.createElement('div')
    createScatterplot({ data: scatterplotData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
