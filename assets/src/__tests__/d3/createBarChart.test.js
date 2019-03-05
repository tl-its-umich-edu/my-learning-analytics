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
    const svg = div.children[0]
    expect(svg).toBeDefined()
    expect(svg.tagName).toEqual('svg')
    expect(Number(svg.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(svg.getAttribute('height'))).toBeGreaterThan(0)

    const tagNames = Array.from(svg.children).map(x => x.tagName)
    expect(tagNames).toEqual(['rect', 'rect', 'rect', 'rect', 'rect', 'rect', 'rect', 'g', 'g'])

    const rects = Array.from(svg.children).filter(x => x.tagName === 'rect')
    const [x, y, width, height] = rects.reduce((acc, curRect) => {
      acc[0].push(Number(curRect.getAttribute('x')))
      acc[1].push(Number(curRect.getAttribute('y')))
      acc[2].push(Number(curRect.getAttribute('width')))
      acc[3].push(Number(curRect.getAttribute('height')))
      return acc
    }, [[], [], [], []])

    x.forEach(x => expect(x).toBeGreaterThan(0))
    y.forEach(x => expect(x).toBeGreaterThan(0))
    width.forEach(x => expect(x).toBeGreaterThan(0))
    height.forEach(x => expect(x).toBeGreaterThan(0))
  })
})
