import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { tip as d3tip } from 'd3-v6-tip'
import './createResourceAccessChart.css'
import { siteTheme } from '../../globals'

/*
  References:
    - https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
    - http://bl.ocks.org/nbremer/326fb6de768e85261bfd47aa1f497863
    - D3 Brush: https://github.com/d3/d3-brush/blob/master/README.md#brushSelection
    - D3 V4 Changes: https://github.com/d3/d3/blob/master/CHANGES.md
*/

const accessedResourceColor = siteTheme.palette.secondary.main
const notAccessedResourceColor = siteTheme.palette.negative.main
const linkColor = siteTheme.palette.link.main

// foreignObjSide specifies the length of one side of the square foreign object element that contains the
// resource icon and padding to its right; this value is also used to calculate the resourceLabelWidth.
const foreignObjSide = 24

const resourceToolTipText = (resource) => {
  if (resource.self_access_count === 0) {
    return '<b>You haven\'t accessed this resource. </b>'
  } else if (resource.self_access_count === 1) {
    return `You accessed this resource once on ${new Date(resource.self_access_last_time).toDateString()}.`
  } else {
    return `You accessed this resource ${resource.self_access_count} times. The last time you accessed this resource was on ${new Date(resource.self_access_last_time).toDateString()}.`
  }
}

const tip = d3tip()
const toolTip = tip.attr('class', 'd3-tip')
  .direction('n').offset([-5, 5])
  .html((event, d) => {
    return resourceToolTipText(d)
  })

function appendLegend (svg) {
  const legendBoxLength = 13
  const legendBoxTextInterval = 20
  const legendInterval = 20
  const legendY = -50

  const legendLabels = [
    ['Resources I haven\'t viewed', 'url(#notAccessedPattern)'],
    ['Resources I\'ve viewed', accessedResourceColor]
  ]

  const legend = svg.select('.mainGroupWrapper').append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(0,0)')

  legend.selectAll('text')
    .data(legendLabels)
    .enter()
    .append('text')
    .attr('font-size', '14px')
    .attr('y', (_, i) => legendY + i * legendInterval + legendBoxLength)
    .attr('x', legendBoxTextInterval)
    .text(d => d[0])

  const legendRect = legend.selectAll('rect')
    .data(legendLabels)
    .enter()
    .append('rect')
    .attr('y', legendY)
    .attr('width', legendBoxLength)
    .attr('height', legendBoxLength)

  legendRect
    .attr('y', (_, i) => legendY + i * legendInterval)
    .attr('x', 0)
    .style('fill', d => d[1])
}

function truncate (selection, labelWidth) {
  selection.each(function (d) {
    const textEl = d3.select(this)
    const textString = d.split('|')[1]
    textEl.text(textString)
    const textPixelLength = textEl.node().getComputedTextLength()
    if (textPixelLength > labelWidth) {
      const numChars = Math.floor(labelWidth / textPixelLength * textString.length) - 3
      textEl.text(`${textString.substring(0, numChars - 1)}...`)
    } else {
      textEl.text(textString)
    }
  })
}

function createResourceAccessChart ({ data, width, height, domElement }) {
  const resourceData = data.sort((a, b) => b.total_percent - a.total_percent)

  /* Assign an index to each resource.  This is used to assist with keyboard navigation
  To set the tab sequence to go from resource name to its corresponding bar graph we use
  tabindex of index*10 for the file name and index*10+1 for the bar
  */
  for (const index in resourceData) {
    resourceData[index].index = Number(index) + 10
  }

  const sideMarginSize = width * 0.075
  const margin = { top: 0, right: sideMarginSize, bottom: 0, left: sideMarginSize }

  const [availWidth, availHeight] = adjustViewport(width, height, margin)

  /*
  The decimal multipliers for values along the horizontal axis should add up to 1.0. In other words,
  the sum of the horizontal values should be equal to the availWidth. Specifically,

  availWidth = mainMargin.left + mainWidth + mainMargin.right + miniMargin.left + miniWidth + miniMargin.right

  Because the main and mini charts share horizontal space, the decimal multipliers for
  values along the vertical axis for each chart should add up to 1.0. In other words, the sum of the
  vertical values for one chart should be equal to the availHeight. To keep the charts aligned,
  the corresponding segment values from each chart should be equal. Specifically,

  availHeight = mainMargin.top + mainHeight + mainMargin.bottom
  availHeight = miniMargin.top + miniHeight + miniMargin.top
  mainMargin.top = miniMargin.top, mainHeight = miniHeight, mainMargin.bottom = miniMargin.bottom
  */

  const mainWidth = availWidth * 0.55
  const mainHeight = availHeight * 0.7
  const mainMargin = {
    top: availHeight * 0.15,
    right: 0,
    bottom: availHeight * 0.15,
    left: availWidth * 0.225
  }

  const miniWidth = availWidth * 0.20
  const miniHeight = mainHeight
  const miniMargin = {
    top: availHeight * 0.15,
    right: 0,
    bottom: availHeight * 0.15,
    left: availWidth * 0.025
  }

  // The space available for a resource label should be mainMargin.left minus the margin between
  // the main and mini charts, minus the horizontal length of the foreign object element.
  const resourceLabelWidth = mainMargin.left - miniMargin.left - foreignObjSide

  const defaultNumberOfResources = 7
  const selectionWindowHeight = resourceData.length < defaultNumberOfResources
    ? mainHeight
    : mainHeight / resourceData.length * defaultNumberOfResources

  const defaultSelection = [0, selectionWindowHeight]

  const mainXScale = d3.scaleLinear().range([0, mainWidth])
  let mainYScale = d3.scaleBand().range([0, mainHeight])

  const miniXScale = d3.scaleLinear().range([0, miniWidth])
  const miniYScale = d3.scaleBand().range([0, miniHeight])

  const textScale = d3.scaleLinear().range([12, 6]).domain([15, 50]).clamp(true)
  // Build the chart
  const main = d3.select(domElement).append('div')

  const svg = main.append('svg')
    .attr('class', 'svgWrapper')
    .attr('width', availWidth)
    .attr('height', availHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .on('wheel.zoom', scroll, { passive: true })
    .on('mousedown.zoom', null) // Override the center selection
    .on('touchstart.zoom', null, { passive: true })
    .on('touchmove.zoom', null)
    .on('touchend.zoom', null)

  function update () {
    const bar = d3.select('.mainGroup').selectAll('.bar')
      .data(resourceData, d => d.resource_name)

    // Initialize
    bar.attr('y', d => mainYScale(d.resource_name))
      .attr('width', d => mainXScale(d.total_percent))
      .attr('height', mainYScale.bandwidth())

    bar.enter()
      .append('rect')
      .attr('tabindex', 0)
      .attr('y', d => mainYScale(d.resource_name))
      .attr('width', d => mainXScale(d.total_percent))
      .attr('height', mainYScale.bandwidth())
      .attr('class', 'bar')
      .attr('fill', d => d.self_access_count > 0
        ? accessedResourceColor
        : 'url(#notAccessedPattern)'
      )
      .on('focus', (e, d) => {
        moveBrushOnFocus(e, d.resource_name)
        toolTip.show(e, d)
      })
      .on('mouseover', toolTip.show)
      .on('blur', toolTip.hide)
      .on('mouseout', toolTip.hide)
      .append('foreignObject')
      .append('div')
      .attr('title', d => d.resource_name.split('|')[1] + ' has been accessed by ' + d.total_percent + '% of students.')

    // Append percentage value text to bars
    svg.selectAll('.label').remove()
    svg.selectAll('.label')
      .data(resourceData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => mainXScale(d.total_percent) + 40 + mainMargin.left)
      .attr('y', d => mainYScale(d.resource_name) + mainYScale.bandwidth() / 2 + mainMargin.top)
      .attr('dx', -10)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .style('fill', d => d.self_access_count > 0 ? 'white' : 'black')
      .attr('text-anchor', 'end')
      .text(d => (
        ((mainYScale(d.resource_name) + mainYScale.bandwidth() / 2) < mainHeight) &&
        ((mainYScale(d.resource_name) + mainYScale.bandwidth() / 2) > 0))
        ? d.total_percent + '%'
        : ''
      )

    bar.exit().remove()
  }

  function scroll (event) {
    // Mouse scroll on the chart
    const selection = d3.brushSelection(gBrush.node())
    const size = selection[1] - selection[0]
    const range = miniYScale.range()
    const y0 = d3.min(range)
    const y1 = d3.max(range) + miniYScale.bandwidth()
    // eslint-disable-next-line no-undef
    const direction = event.webkitDirectionInvertedFromDevice
    let dy = -event.deltaY
    if (direction < 0) {
      dy *= -1
    }
    const topSection = selection[0] - dy < y0
      ? y0
      : selection[1] - dy > y1
        ? y1 - size
        : selection[0] - dy

    // Make sure the page doesnt scroll
    event.stopPropagation()
    // Move the brush
    gBrush.call(brush.move, [topSection, topSection + size])
  }

  function brushmove (event) {
    const fullRange = mainYZoom.range()
    const selection = event
      ? event.selection[1] === 0 // prevents [0, 0] from being returned, which causes bug
          ? [0, 0.1]
          : event.selection
      : defaultSelection

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
    const mainYAxis = d3
      .axisLeft(mainYScale)
      .tickSize(0)
      .tickFormat(d => d.split('|')[1])

    mainGroup.select('.axis--y').call(mainYAxis)

    // Updated style of selected bars
    const selected = miniYScale.domain()
      .filter(d => selection[0] - miniYScale.bandwidth() <= miniYScale(d) && miniYScale(d) <= selection[1])

    d3.select('.miniGroup').selectAll('.bar')
      .style('fill', d => d.self_access_count > 0
        ? accessedResourceColor
        : 'url(#notAccessedPattern)'
      )
      .style('opacity', d => selected.includes(d.resource_name)
        ? 1
        : 0.5
      )

    // Update the resource label names on Y axis
    d3.selectAll('.axis--y .tick text')
      .attr('x', (mainMargin.left - foreignObjSide) * -1)
      .attr('fill', linkColor)
      .style('font-size', textScale(selected.length))
      .call(truncate, resourceLabelWidth)

    update()
  }

  function brushcenter (event) {
    const selection = d3.brushSelection(gBrush.node())
    const size = selection[1] - selection[0]
    const range = miniYScale.range()
    const y0 = d3.min(range) + size / 2
    const y1 = d3.max(range) + miniYScale.bandwidth() - size / 2
    const center = Math.max(y0, Math.min(y1, d3.pointer(event)[1]))
    event.stopPropagation()
    gBrush.call(brush.move, [center - size / 2, center + size / 2])
  }

  function moveBrushOnFocus (event, dataKey) {
    const selection = d3.brushSelection(gBrush.node())
    const size = selection[1] - selection[0]
    const miniY = miniYScale(dataKey)
    const step = miniYScale.step()
    // Start brush at bar if brush size is less than two steps, otherwise put at the end minus steps
    const newY = size < (step * 2)
      ? miniY + size
      // Use size if size is greater than or equal to bar plus two steps, otherwise use bar plus steps
      : (miniY + step * 2) <= size
          ? size
          // Use two steps after bar if there is space, otherwise use one step
          : miniY <= miniYScale.range()[1] - step
            ? miniY + step * 2
            : miniY + step
    const newSelection = [newY - size, newY]
    event.stopPropagation()
    gBrush.call(brush.move, newSelection)
  }

  // Main chart group
  const mainGroup = svg.append('g')
    .attr('class', 'mainGroupWrapper')
    .attr('transform', `translate(${mainMargin.left}, ${mainMargin.top})`)
    .append('g')
    .attr('clip-path', 'url(#clip)')
    .style('clip-path', 'url(#clip)')
    .attr('class', 'mainGroup')

  // Mini chart group
  const miniTopLeftX = mainMargin.left + mainWidth + mainMargin.right + miniMargin.left
  const miniTopLeftY = miniMargin.top

  const miniGroup = svg.append('g')
    .attr('class', 'miniGroup')
    .attr('transform', `translate(${miniTopLeftX}, ${miniTopLeftY})`)

  const brushGroup = svg.append('g')
    .attr('class', 'brushGroup')
    .attr('transform', `translate(${(miniTopLeftX)}, ${miniTopLeftY})`)

  // Scales
  const mainYZoom = d3.scaleLinear().range([0, mainHeight])
    .domain([0, mainHeight])

  // Axis
  const mainXAxis = d3.axisBottom(mainXScale)
    .ticks(6)
    .tickSizeOuter(10)

  const mainYAxis = d3.axisLeft(mainYScale)
    .tickSize(0)
    .tickFormat(d => d.split('|')[1])

  // Brush
  const brush = d3.brushY()
    .extent([[0, 0], [miniWidth, miniHeight]])
    .on('brush', brushmove)
    .handleSize(20)

  const gBrush = brushGroup.append('g')
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
    .on('touchstart.brush', brushcenter, { passive: true })

  const defs = svg.append('defs')

  // Clips
  defs.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', -mainMargin.left)
    .attr('width', mainWidth + mainMargin.left)
    .attr('height', mainHeight)

  // Pattern for not accessed: black stripes on gray background
  defs.append('pattern')
    .attr('id', 'notAccessedPattern')
    .attr('width', 10)
    .attr('height', 10)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('patternTransform', 'rotate(45)')
    .append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', notAccessedResourceColor)
  defs.select('#notAccessedPattern')
    .append('rect')
    .attr('width', 2)
    .attr('height', 10)
    .attr('fill', 'black')

  // Inject data
  // Domain
  mainXScale.domain([0, d3.max(resourceData, d => d.total_percent)])
  miniXScale.domain([0, d3.max(resourceData, d => d.total_percent)])
  mainYScale.domain(resourceData.map(d => d.resource_name))
    .paddingInner(0.4)
    .paddingOuter(0)
  miniYScale.domain(resourceData.map(d => d.resource_name))
    .paddingInner(0.4)
    .paddingOuter(0)

  // Append axis to main chart
  const xAxis = d3.select('.mainGroupWrapper')
    .append('g')
    .attr('class', 'axis--x black-axis-line black-axis-text')
    .attr('transform', `translate(0,${mainHeight})`)
    .call(mainXAxis.tickFormat(d => d + '%'))

  // Append label to X axis
  xAxis.append('text')
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${mainWidth / 2}, 40)`)
    .text('Percentage of All Students in the Selected Grade Range')
    .style('font-size', '14px')

  mainGroup.insert('g', ':first-child')
    .attr('class', 'axis--y black-axis-line')
    .attr('transform', 'translate(0,0)')
    .call(mainYAxis)

  // Draw mini bars
  miniGroup.selectAll('.bar')
    .data(resourceData, d => d.resource_name)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', d => miniYScale(d.resource_name))
    .attr('width', d => miniXScale(d.total_percent))
    .attr('height', miniYScale.bandwidth())
    .attr('class', 'bar')
    .attr('fill', d => d.self_access_count > 0
      ? accessedResourceColor
      : 'url(#notAccessedPattern)'
    )

  // Add brush to main chart
  miniGroup.append('g')
    .attr('class', 'brush')
    .call(brush)

  // Legend
  appendLegend(svg)

  svg.call(toolTip)

  brushmove()

  // Truncate resource label names on Y axis
  d3.selectAll('.axis--y .tick text')
    .call(truncate, resourceLabelWidth)

  // Add links and icons to Y axis
  d3.selectAll('.axis--y .tick').each(function (d) {
    // Have to use ES5 function to correctly use `this` keyword
    const link = d.split('|')[0]
    const name = d.split('|')[1]
    const a = d3.select(this.parentNode).append('a')
      .attr('title', name)
      .attr('target', '_blank')
      .attr('href', link)
      .attr('text-anchor', 'start')
      .attr('tabindex', 0)
      .on('focus', (e) => moveBrushOnFocus(e, d))
    a.node().appendChild(this)

    const icon = d.split('|')[2]
    d3.select(this).insert('foreignObject')
      .attr('x', mainMargin.left * -1)
      .attr('y', -6)
      .attr('width', foreignObjSide)
      .attr('height', foreignObjSide)
      .attr('color', linkColor)
      .append('xhtml:i')
      .attr('class', icon)
  })

  svg.selectAll('text')
    .attr('font-family', '"Roboto", "Helvetica", "Arial", sans-serif')
}

export default createResourceAccessChart
