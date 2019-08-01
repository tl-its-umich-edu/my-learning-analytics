import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import d3tip from 'd3-tip'
import './createResourceAccessChart.css'

function createResourceAccessChart ({ data, width, height, domElement }) {
  /*
          References:
              - https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
              - http://bl.ocks.org/nbremer/326fb6de768e85261bfd47aa1f497863
              - D3 Brush: https://github.com/d3/d3-brush/blob/master/README.md#brushSelection
              - D3 V4 Changes: https://github.com/d3/d3/blob/master/CHANGES.md
      */

  const update = () => {
    let bar = d3.select('.mainGroup').selectAll('.bar')
      .data(resourceData, d => d.resource_name)

    // Initialize
    bar.attr('x', 0)
      .attr('y', d => mainYScale(d.resource_name))
      .attr('width', d => mainXScale(d.total_count))
      .attr('height', mainYScale.bandwidth())

    bar
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => mainYScale(d.resource_name))
      .attr('width', d => mainXScale(d.total_count))
      .attr('height', mainYScale.bandwidth())
      .attr('class', 'bar')
      .attr('fill', d => d.self_access_count > 0 ? COLOR_ACCESSED_RESOURCE : COLOR_NOT_ACCESSED_RESOURCE)
      .on('mouseover', toolTip.show)
      .on('mouseout', toolTip.hide)

    // Append text to bars
    svg.selectAll('.label').remove()
    svg.selectAll('.label')
      .data(resourceData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => mainXScale(d.total_count) + 3 + mainMargin.left)
      .attr('y', d => mainYScale(d.resource_name) + mainYScale.bandwidth() / 2 + mainMargin.top)
      .attr('dx', -10)
      .attr('dy', '.35em')
      .style('font-size', 10)
      .attr('text-anchor', 'end')
      .text(d => (
        ((mainYScale(d.resource_name) + mainYScale.bandwidth() / 2) < mainHeight) &&
        ((mainYScale(d.resource_name) + mainYScale.bandwidth() / 2) > 0))
        ? d.total_count
        : ''
      )

    bar.exit().remove()
  }

  const brushmove = () => {
    let fullRange = mainYZoom.range()
    let selection = d3.event ? d3.event.selection : defaultSelection

    // Update the axes
    // Map selection area to full range
    mainYZoom.domain(selection)
    // Update the main domain
    mainYScale = d3.scaleBand()
      .range([mainYZoom(fullRange[0]), mainYZoom(fullRange[1])])
      .paddingInner(0.4)
      .paddingOuter(0)

    mainYScale.domain(resourceData.map(d => d.resource_name))

    // Update the y axis
    let mainYAxis = d3.axisLeft(mainYScale).tickSize(0).tickFormat(d => d.split('|')[1])

    mainGroup.select('.axis--y').call(mainYAxis)

    // Updated style of selected bars
    let selected = miniYScale.domain()
      .filter(d => selection[0] - miniYScale.bandwidth() <= miniYScale(d) && miniYScale(d) <= selection[1])

    d3.select('.miniGroup').selectAll('.bar')
      .style('fill', d => d.self_access_count > 0 ? COLOR_ACCESSED_RESOURCE : COLOR_NOT_ACCESSED_RESOURCE)
      .style('opacity', d => selected.includes(d.resource_name) ? '1' : '0.5')

    // Update the label size
    d3.selectAll('.axis--y text')
      .style('font-size', textScale(selected.length))

    update()
  }

  const scroll = () => {
    // Mouse scroll on the chart
    let selection = d3.brushSelection(gBrush.node())
    let size = selection[1] - selection[0]
    let range = miniYScale.range()
    let y0 = d3.min(range)
    let y1 = d3.max(range) + miniYScale.bandwidth()
    let dy = d3.event.deltaY
    let topSection

    if (selection[0] - dy < y0) topSection = y0
    else if (selection[1] - dy > y1) topSection = y1 - size
    else topSection = selection[0] - dy

    // Make sure the page doesnt scroll
    d3.event.stopPropagation()
    d3.event.preventDefault()
    // Move the brush
    gBrush.call(brush.move, [topSection, topSection + size])
  }

  const brushcenter = () => {
    let target = d3.event.targe
    let selection = d3.brushSelection(gBrush.node())
    let size = selection[1] - selection[0]
    let range = miniYScale.range()
    let y0 = d3.min(range) + size / 2
    let y1 = d3.max(range) + miniYScale.bandwidth() - size / 2
    let center = Math.max(y0, Math.min(y1, d3.mouse(target)[1]))

    d3.event.stopPropagation()
    gBrush.call(brush.move, [center - size / 2, center + size / 2])
  }

  let resourceData = data
  resourceData.sort((a, b) => b.total_count - a.total_count)

  // colors used for different resource states
  let COLOR_ACCESSED_RESOURCE = 'steelblue'
  let COLOR_NOT_ACCESSED_RESOURCE = 'gray'

  let defaultSelection = [0, 50]
  let mainMargin = { top: 50, right: 10, bottom: 50, left: 200 }
  let [mainWidth, mainHeight] = adjustViewport(width, height, mainMargin)

  let miniMargin = { top: 50, right: 10, bottom: 50, left: 10 }
  let miniWidth = 100 - miniMargin.left - miniMargin.right
  let miniHeight = mainHeight

  // Build the chart
  let svg = d3.select(domElement).append('svg')
    .attr('class', 'svgWrapper')
    .attr('width', mainWidth + mainMargin.left + mainMargin.right + miniWidth + miniMargin.left + miniMargin.right)
    .attr('height', mainHeight + mainMargin.top + mainMargin.bottom)
    .on('wheel.zoom', scroll)
    .on('mousedown.zoom', null) // Override the center selection
    .on('touchstart.zoom', null)
    .on('touchmove.zoom', null)
    .on('touchend.zoom', null)

  // Tooltip
  let toolTip = d3tip().attr('class', 'd3-tip')
    .direction('n').offset([-5, 5])
    .html(d => {
      let selfString
      if (d.self_access_count === 0) {
        selfString = `<b>You haven't viewed this resource. </b > `
      } else if (d.self_access_count === 1) {
        selfString = 'You have read the resource once on ' + new Date(d.self_access_last_time).toDateString() + '.'
      } else {
        selfString = 'You have read the resource ' + d.self_access_count + ' times. The last time you accessed this resource was on ' + new Date(d.self_access_last_time).toDateString() + '.'
      }
      return selfString
    })

  // Style tooltip
  svg.call(toolTip)

  // Main chart group
  let mainGroup = svg.append('g')
    .attr('class', 'mainGroupWrapper')
    .attr('transform', 'translate(' + mainMargin.left + ',' + mainMargin.top + ')')
    .append('g')
    .attr('clip-path', 'url(#clip)')
    .style('clip-path', 'url(#clip)')
    .attr('class', 'mainGroup')

  // Mini chart group
  let miniGroup = svg.append('g')
    .attr('class', 'miniGroup')
    .attr('transform', 'translate(' + (mainMargin.left + mainWidth + mainMargin.right + miniMargin.left) + ',' + miniMargin.top + ')')

  let brushGroup = svg.append('g')
    .attr('class', 'brushGroup')
    .attr('transform', 'translate(' + (mainMargin.left + mainWidth + mainMargin.right + miniMargin.left) + ',' + miniMargin.top + ')')

  // Scales
  let mainXScale = d3.scaleLinear().range([0, mainWidth])
  let miniXScale = d3.scaleLinear().range([0, miniWidth])
  let mainYScale = d3.scaleBand().range([0, mainHeight])
  let miniYScale = d3.scaleBand().range([0, miniHeight])
  let textScale = d3.scaleLinear().range([12, 6]).domain([15, 50]).clamp(true)

  let mainYZoom = d3.scaleLinear().range([0, mainHeight])
    .domain([0, mainHeight])

  // Axis
  let mainXAxis = d3.axisBottom(mainXScale)
    .ticks(6)
    .tickSizeOuter(10)

  let mainYAxis = d3.axisLeft(mainYScale)
    .tickSize(0)
    .tickFormat(d => d.split('|')[1])

  // Brush
  let brush = d3.brushY()
    .extent([[0, 0], [miniWidth, miniHeight]])
    .on('brush', brushmove)
    .handleSize(20)

  let gBrush = brushGroup.append('g')
    .attr('class', 'brush')
    .call(brush)
    .call(brush.move, defaultSelection)

  // Styling Brush
  gBrush.selectAll('.handle')
    .append('line')
    .attr('x2', miniWidth)

  gBrush.selectAll('rect')
    .attr('width', miniWidth)

  // onClick center the brush
  gBrush
    .select('.overlay')
    .on('mousedown.brush', brushcenter)
    .on('touchstart.brush', brushcenter)

  // Clips
  svg.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', -mainMargin.left)
    .attr('width', mainWidth + mainMargin.left)
    .attr('height', mainHeight)

  // Inject data
  // Domain
  mainXScale.domain([0, d3.max(resourceData, d => d.total_count)])
  miniXScale.domain([0, d3.max(resourceData, d => d.total_count)])
  mainYScale.domain(resourceData.map(d => d.resource_name))
    .paddingInner(0.4)
    .paddingOuter(0)
  miniYScale.domain(resourceData.map(d => d.resource_name))
    .paddingInner(0.4)
    .paddingOuter(0)

  // Append axis to main chart
  let xLabel = d3.select('.mainGroupWrapper')
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(' + 0 + ',' + (mainHeight + 5) + ')')
    .call(mainXAxis.tickFormat(d => d + '%'))

  xLabel.append('text')
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(' + mainWidth / 2 + ', ' + 40 + ')')
    .text('Percentage of All Students in the Selected Grade Range')
    .style('font-size', '14px')

  let yLabel = mainGroup.append('g')
    .attr('class', 'axis axis--y')
    .attr('transform', 'translate(-5,0)')
    .call(mainYAxis)

  yLabel.selectAll('text')
    .attr('fill', 'steelblue')

  // Add links to resource name
  d3.selectAll('.axis--y .tick').each(function (d) {
    // Have to use ES5 function to correctly use `this` keyword
    let link = d.split('|')[0]
    const a = d3.select(this.parentNode).append('a')
      .attr('xlink:target', '_blank')
      .attr('xlink:href', link)
    a.node().appendChild(this)
  })

  // Draw mini bars
  miniGroup.selectAll('.bar')
    .data(resourceData, d => d.resource_name)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => miniYScale(d.resource_name))
    .attr('width', d => miniXScale(d.total_count))
    .attr('height', miniYScale.bandwidth())
    .attr('class', 'bar')
    .attr('fill', d => d.self_access_count > 0 ? COLOR_ACCESSED_RESOURCE : COLOR_NOT_ACCESSED_RESOURCE)

  // Add brush to main chart
  miniGroup.append('g')
    .attr('class', 'brush')
    .call(brush)

  // Legend
  let w = 800 - mainMargin.left - mainMargin.right
  let legendBoxLength = 10
  let legendBoxTextInterval = 15
  let legendInterval = 20
  let legendY = -50

  let legendLabels = [[`Resources I haven't viewed`, COLOR_NOT_ACCESSED_RESOURCE],
    [`Resources I've viewed`, COLOR_ACCESSED_RESOURCE]]

  let legend = svg.select('.mainGroupWrapper').append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(-550, 0)`)

  let legendRect = legend.selectAll('rect')
    .data(legendLabels)
    .enter()
    .append('rect')
    .attr('y', legendY)
    .attr('width', legendBoxLength)
    .attr('height', legendBoxLength)

  legendRect
    .attr('y', (d, i) => legendY + i * legendInterval)
    .attr('x', w)
    .style('fill', d => d[1])

  legend.selectAll('text')
    .data(legendLabels)
    .enter()
    .append('text')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '14px')
    .attr('y', (d, i) => legendY + i * legendInterval + legendBoxLength)
    .attr('x', w + legendBoxTextInterval)
    .text(d => d[0])

  brushmove()
}

export default createResourceAccessChart
