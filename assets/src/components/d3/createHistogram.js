import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createHistogram ({ data, width, height, el, tip, xAxisLabel, yAxisLabel, myGrade }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .domain([0, 100]).nice()
    .range([margin.left, aWidth - margin.right])

  const bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(40))(data)

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([aHeight - margin.bottom, margin.top])

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const bar = svg.selectAll('rect')
    .data(bins).enter()
    .append('rect')
    .attr('x', d => x(d.x0) + 1)
    .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr('y', d => y(d.length))
    .attr('height', d => y(0) - y(d.length))
    .attr('fill', 'steelblue')

  bar.append('text')
    .attr('y', 10)
    .attr('x', (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr('height', d => height - y(d.length) - 50)
    .attr('text-anchor', 'middle')
    .attr('color', 'white')
    .text(d => d === 0 ? d.length : '')

  const xAxis = g => g
    .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
    .call(d3
      .axisBottom(x)
      .tickSizeOuter(0)
      .ticks(width > 750 ? 20 : 10)
      .tickFormat(d => `${d}%`)
    )
    .call(g => g.append('text')
      .attr('x', aWidth - margin.right)
      .attr('y', -4)
      .attr('fill', 'rgba(0, 0, 0, 0.87)')
      .attr('text-anchor', 'end')
      .attr('font-size', '0.875rem')
      .attr('font-weight', '400')
      .attr('font-family', 'Roboto Helvetica Arial sans-serif')
      .attr('line-height', '1.46429em')
      .text(xAxisLabel)
    )

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .attr('class', 'axis')
    .call(d3.axisLeft(y).tickSizeInner(-aWidth).ticks(5))
    .call(g => g.select('.domain').remove())
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 4)
      .attr('fill', 'rgba(0, 0, 0, 0.87)')
      .attr('text-anchor', 'end')
      .attr('font-size', '0.875rem')
      .attr('font-weight', '400')
      .attr('font-family', 'Roboto Helvetica Arial sans-serif')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
      .text(yAxisLabel).attr('dy', -4)
    )

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)

  if (myGrade) {
    svg.append('line')
      .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
      .attr('x1', x(myGrade))
      .attr('y1', -aHeight)
      .attr('x2', x(myGrade))
      .attr('y2', 0)
      .attr('stroke', 'darkorange')
      .attr('stroke-width', '2')
    svg.append('text')
      .attr('x', x(myGrade))
      .attr('d', '1em')
      .attr('y', margin.bottom)
      .text('My Grade')
      .attr('font-size', '0.875rem')
      .attr('font-weight', '400')
      .attr('font-family', 'Roboto Helvetica Arial sans-serif')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
  }

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createHistogram
