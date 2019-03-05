import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createDonutChart ({ data, width, height, el, tip }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const radius = Math.min(aWidth, aHeight) / 2
  const arc = d3.arc().innerRadius(radius * 0.67).outerRadius(radius - 1)

  const pie = d3
    .pie()
    .padAngle(0.005)
    .sort(null)
    .value(d => d.value)

  const arcs = pie(data)

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const g = svg.append('g')
    .attr('transform', `translate(${aWidth / 2},${aHeight / 2})`)

  g.selectAll('path')
    .data(arcs)
    .join('path')
    .attr('d', arc)

  return svg
}

export default createDonutChart
