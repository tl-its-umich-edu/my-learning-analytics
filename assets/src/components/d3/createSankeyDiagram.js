// most from https://beta.observablehq.com/@mbostock/d3-sankey-diagram, will need to be modified for our use case

import * as d3 from 'd3'
import { sankey as Sankey, sankeyLinkHorizontal } from 'd3-sankey'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

const color = d3.scaleOrdinal(d3.schemeCategory10)
const pickColor = name => color(name.replace(/ .*/, ''))

const f = d3.format(',.0f')
const format = d => `${f(d)} TWh`

function createSankeyDiagram ({ data, width, height, el }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const sankey = Sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent(([[1, 1], [aWidth - 1, aHeight - 5]]))

  const createSankey = ({ nodes, links }) => sankey({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  })

  const { nodes, links } = createSankey(data)

  svg.append('g')
    .selectAll('rect')
    .data(nodes)
    .enter().append('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('height', d => d.y1 - d.y0)
    .attr('width', d => d.x1 - d.x0)
    .attr('fill', d => color(d.name))
    .append('title')
    .text(d => `${d.name}\n${format(d.value)}`)

  const link = svg.append('g')
    .attr('fill', 'none')
    .attr('stroke-opacity', 0.5)
    .selectAll('g')
    .data(links)
    .enter().append('g')
    .style('mix-blend-mode', 'multiply')

  const gradient = link.append('linearGradient')
    .attr('id', d => d.id)
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', d => d.source.x1)
    .attr('x2', d => d.target.x0)

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', d => pickColor(d.source.name))

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', d => pickColor(d.target.name))

  link.append('path')
    .attr('d', sankeyLinkHorizontal())
    .attr('stroke', d => color(d.source.name))
    .attr('stroke-width', d => Math.max(1, d.width))

  link.append('title')
    .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`)

  svg.append('g')
    .style('font', '10px sans-serif')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
    .attr('y', d => (d.y1 + d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
    .text(d => d.name)
}

export default createSankeyDiagram
