import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'

function createHistogram ({ data, width, height, el, xAxisLabel, yAxisLabel, myGrade, maxGrade = 100 }) {
  const margin = { top: 20, right: 20, bottom: 50, left: 40 }
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const x = d3.scaleLinear()
    .domain([0, maxGrade]).nice()
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
    .append('g')

  bar.append('rect')
    .attr('x', d => x(d.x0) + 1)
    .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr('y', d => y(d.length))
    .attr('height', d => y(0) - y(d.length))
    .attr('fill', 'steelblue')

  bar.append('text')
    .attr('x', d => x((d.x1 + d.x0) / 2))
    .attr('y', d => y(d.length) + margin.top-5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.length === 0 ? '' : d.length)

  const xAxis = g => g
    .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
    .call(d3
      .axisBottom(x)
      .tickSizeOuter(0)
      .ticks(width > 750 ? 20 : 10)
      .tickFormat(d => `${d}%`)
    )
    .call(g => g.append('text')
      .attr('x', aWidth / 2)
      .attr('y', 40)
      .attr('fill', 'rgba(0, 0, 0, 0.87)')
      .attr('font-size', '0.875rem')
      .attr('font-weight', '400')
      .attr('font-family', 'Roboto Helvetica Arial sans-serif')
      .attr('line-height', '1.46429em')
      .text(xAxisLabel).attr('dy', -4)
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
      .attr('x', x(myGrade) - 110)
      .attr('y', margin.top-5)
      .text(`My Grade: ${myGrade}%`)
      .attr('font-size', '0.875rem')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Roboto Helvetica Arial sans-serif')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
  }

}

export default createHistogram
