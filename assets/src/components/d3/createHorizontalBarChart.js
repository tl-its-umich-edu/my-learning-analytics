import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createHorizontalBarChart ({ data, width, height, el, tip }) {
  const modifiedMargin = { ...margin, left: 120 }
  const [aWidth, aHeight] = adjustViewport(width, height, modifiedMargin)

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.data)]).nice()
    .range([modifiedMargin.left, aWidth - modifiedMargin.right])

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([aHeight - modifiedMargin.bottom, modifiedMargin.top])
    .padding(0.1)

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const bar = svg.selectAll('.bar')
    .data(data).enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(0))
    .attr('width', d => x(d.data) - x(0))
    .attr('y', d => y(d.label))
    .attr('height', y.bandwidth())

  svg.append('g')
    .attr('transform', `translate(0, ${aHeight - modifiedMargin.bottom})`)
    .call(d3.axisBottom(x))

  svg.append('g')
    .attr('transform', `translate(${modifiedMargin.left},0)`)
    .call(d3.axisLeft(y))

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createHorizontalBarChart
