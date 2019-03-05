import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'
import { getValues, flatten } from '../../util/array'

function createGroupedBarChart ({ data, width, height, tip, el }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x0 = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.left, aWidth - margin.right])
    .padding(0.1)

  const keys = Object.keys(data[0].data)

  const x1 = d3.scaleBand()
    .domain(keys)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.5)

  const y = d3.scaleLinear()
    .domain([0, d3.max(flatten(data.map(x => getValues(x.data))))]).nice()
    .range([aHeight - margin.bottom, margin.top])

  const colours = d3.scaleOrdinal()
    .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'])

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const g = svg.append('g')
    .selectAll('g')
    .data(data).enter()
    .append('g')
    .attr('transform', d => `translate(${x0(d.label)}, 0)`)

  const bar = g.selectAll('rect')
    .data(d => keys.map(key => ({ key, data: d.data[key] })))
    .enter().append('rect')
    .attr('x', d => x1(d.key))
    .attr('y', d => y(d.data))
    .attr('width', x1.bandwidth())
    .attr('height', d => aHeight - margin.bottom - y(d.data))
    .attr('fill', d => colours(d.key))

  svg.append('g')
    .attr('transform', `translate(0,${aHeight - margin.bottom})`)
    .call(d3.axisBottom(x0))

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, 's'))
    .append('text')
    .attr('x', 2)
    .attr('y', y(y.ticks().pop()) + 0.5)
    .attr('dy', '0.32em')
    .attr('fill', '#000')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'start')
    .text('Population')

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createGroupedBarChart
