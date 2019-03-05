import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createProgressChart ({ data, width, height, el, tip }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .range([0, aWidth])

  const y = d3.scaleBand()
    .range([0, aHeight])

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const bar = svg.selectAll('.bar')
    .data(data).enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x())
    .attr('width', d => {

    })
    .attr('height', d => {

    })

  return svg
}

export default createProgressChart
