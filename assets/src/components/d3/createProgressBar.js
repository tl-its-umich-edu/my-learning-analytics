import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { siteTheme } from '../../globals'

function createProgressBar ({ data, width, height, domElement, tip }) {
  const margin = { top: 20, right: 20, bottom: 20, left: 50 }
  const gradedColor = siteTheme.palette.secondary.main
  const ungradedColor = siteTheme.palette.info.main
  const unsubmittedColor = siteTheme.palette.negative.main
  let [aWidth, aHeight] = adjustViewport(width, height, margin)

  // prevent height from being too tall or too short
  aHeight = aHeight > 80 ? 80 : aHeight
  aHeight = aHeight < 60 ? 60 : aHeight

  const memo = new Map()
  const calculatePercentSoFar = i => {
    if (memo.has(i)) {
      return memo.get(i)
    } else {
      const percentSoFar = data.slice(0, i)
        .reduce((acc, d) => (acc += d.percent_gotten), 0)
      memo.set(i, percentSoFar)
      return percentSoFar
    }
  }

  const x = d3.scaleLinear()
    .domain([0, 100])
    .range([margin.left, aWidth - margin.right])

  const y = d3.scaleBand()
    .range([aHeight - margin.bottom, margin.top])

  const svg = d3.select(domElement).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const bar = svg.selectAll('g')
    .data(data).enter()
    .append('g')

  const tipPosition = (direction = 's') => {
    tip.direction(direction)
      .offset([0, 60])
      .style('max-width', '300px')
  }

  bar.append('rect')
    .attr('width', d => x(d.percent_gotten) - margin.left)
    .attr('x', (_, i) => x(calculatePercentSoFar(i)))
    .attr('height', y.bandwidth())
    .attr('y', margin.top)
    .attr('fill', d => d.graded ? gradedColor : d.submitted ? ungradedColor : unsubmittedColor)
    .style('border', '1px solid transparent')
    .style('outline-color', 'rgb(255, 255, 255)')
    .style('outline-style', 'solid')
    .style('outline-width', '1px')
    .on('mouseover', function () {
      const x = d3.mouse(this)[0]
      const percentVariation = ((aWidth - x) / aWidth) * 100
      if (percentVariation < 7) {
        tipPosition('sw')
      } else {
        tipPosition('s')
      }
      d3.select(this)
        .attr('fill', d => d.graded ? gradedColor : d.submitted ? ungradedColor : unsubmittedColor)
        .style('outline', '1px solid black')
    })
    .on('mouseout', function () {
      d3.select(this)
        .attr('fill', d => d.graded ? gradedColor : d.submitted ? ungradedColor : unsubmittedColor)
        .style('outline', '1px solid rgb(255, 255, 255)')
    })

  bar.append('text')
    .attr('x', (_, i) => x(calculatePercentSoFar(i)))
    .attr('y', margin.top + y.bandwidth() / 2)
    .text(d => {
      const name = d.name
      const widthOfRect = x(d.percent_gotten) - margin.left
      const charsThatCanFit = Math.floor(widthOfRect / 9)
      const displayable = name.length < charsThatCanFit
        ? name
        : name.slice(0, Math.floor(widthOfRect / 9)) + '...'
      return displayable
    })
    .style('font-size', '0.875rem')
    .style('fill', d => d.graded ? 'white' : 'black')
    .style('text-overflow', 'ellipsis')

  const xAxis = g => g
    .attr('transform', `translate(0, ${aHeight - margin.bottom})`)
    .call(d3
      .axisBottom(x)
      .tickFormat(d => `${d}%`)
      .ticks(width > 750 ? 20 : width > 500 ? 10 : 5)
    )

  const currentIndex = data.filter(x => x.graded).length
  const currentLine = svg.append('g')
  // only show currentline when assignments are graded
  if (currentIndex !== 0) {
    currentLine
      .append('line')
      .attr('x1', x(calculatePercentSoFar(currentIndex)))
      .attr('x2', x(calculatePercentSoFar(currentIndex)))
      .attr('y1', 0)
      .attr('y2', aHeight - margin.bottom)
      .attr('stroke', 'darkorange')
      .attr('stroke-width', '1')

    currentLine.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', x(calculatePercentSoFar(currentIndex)) - 26)
      .attr('y', margin.top)
      .attr('dy', -7)
      .attr('fill', 'darkorange')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Current')
  }

  const maxLine = svg.append('g')

  // login to show the maxLine based on the graded and ungraded data
  const showMaxLine = (data) => {
    // filtering the graded and ungraded values, list would be either 2 or 1
    const gradedList = [...new Set(data.map(item => item.graded))]
    if (gradedList.length > 1) {
      return true
    }
    return !gradedList[0]
  }

  if (showMaxLine(data)) {
    maxLine
      .append('line')
      .attr('x1', x(calculatePercentSoFar(data.length)))
      .attr('x2', x(calculatePercentSoFar(data.length)))
      .attr('y1', 0)
      .attr('y2', aHeight - margin.bottom)
      .attr('stroke', 'green')
      .attr('stroke-width', '1')

    maxLine.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', x(calculatePercentSoFar(data.length)) - 42)
      .attr('y', margin.top)
      .attr('dy', -7)
      .attr('fill', 'green')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Max Possible')
  }

  svg.append('g')
    .call(xAxis)

  if (tip) {
    svg.call(tip)
    bar
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createProgressBar
