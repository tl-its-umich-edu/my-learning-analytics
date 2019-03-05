import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createScatterplot ({ data, width, height, el, tip, xAxisLabel, yAxisLabel }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .domain([0, 100])
    .range([margin.left, aWidth - margin.right])

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([aHeight - margin.bottom, margin.top])

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const circle = svg.selectAll('.dot')
    .data(data).enter()
    .append('circle')
    .attr('cx', d => x(d.x))
    .attr('cy', d => y(d.y))
    .attr('r', d => 3)

  const xAxis = g => g
    .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
    .call(d3
      .axisBottom(x)
      .tickSizeOuter(0)
      .tickValues([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      .tickFormat(d => `${d}%`)
    )
    .call(g => g.append('text')
      .attr('x', aWidth - margin.right)
      .attr('y', -4)
      .attr('fill', '#000')
      .attr('text-anchor', 'end')
      .text(xAxisLabel)
    )

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .attr('class', 'axis')
    .call(d3.axisLeft(y).tickSizeInner(-aWidth).ticks(6))
    .call(g => g.select('.domain').remove())
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 5)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .text(yAxisLabel).attr('dy', -4)
    )

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)

  if (tip) {
    svg.call(tip)
    circle
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createScatterplot
