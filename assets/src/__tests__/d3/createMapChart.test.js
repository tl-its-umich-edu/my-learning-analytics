/* global describe, test, expect */
import createMapChart from '../../components/d3/createMapChart'
import { mapData } from '../testData/d3TestData'

describe('createMapChart', () => {
  test('should build a map chart with Afghanistan and Canada', () => {
    const div = document.createElement('div')
    createMapChart({ data: mapData, width: 1000, height: 500, el: div })
    expect(div).toMatchSnapshot()
  })
})
