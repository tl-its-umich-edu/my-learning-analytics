import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'
import createSVG from './createSVG'
import createLine from './createLine'

function createLineChart ({ data, width, height, el }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.label)]).nice()
    .range([margin.left, aWidth - margin.right])

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.data)]).nice()
    .range([aHeight - margin.bottom, margin.top])

  const xAxis = g => g
    .attr('transform', `translate(0,${aHeight - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(aWidth / 80).tickSizeOuter(0))

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  const svg = createSVG({ el, width, height })

  createLine({ svg, x, y, data })

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)
}

export default createLineChart
