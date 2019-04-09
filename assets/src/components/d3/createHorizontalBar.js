import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'

function createHorizontalBar ({ data, width, height, el, tip }) {
  const margin = { top: 0, bottom: 0, left: 0, right: 0 }
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .domain([0, 100]).nice()
    .range([margin.left, aWidth - margin.right])

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([aHeight - margin.bottom, margin.top])
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

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createHorizontalBar
