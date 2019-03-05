import * as d3 from 'd3'

function createLine ({ svg, x, y, data }) {
  const line = d3.line()
    .defined(d => !isNaN(d.data))
    .x(d => x(d.label))
    .y(d => y(d.data))

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('d', line)
}

export default createLine
