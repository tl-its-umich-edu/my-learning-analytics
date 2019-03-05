import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createBarChart ({ data, width, height, el, tip }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.left, aWidth - margin.right])
    .padding(0.1)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.data)]).nice()
    .range([aHeight - margin.bottom, margin.top])

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const bar = svg.selectAll('.bar')
    .data(data).enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.label))
    .attr('width', x.bandwidth())
    .attr('y', d => y(d.data))
    .attr('height', d => y(0) - y(d.data))

  svg.append('g')
    .attr('transform', `translate(0, ${aHeight - margin.bottom})`)
    .call(d3.axisBottom(x))

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createBarChart
