import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { roundToXDecimals } from '../../util/math'
import { isInRange } from '../../util/chartsMisc'
import { siteTheme } from '../../globals'

function createHistogram ({ data, width, height, domElement, xAxisLabel, yAxisLabel, showGrade, gradesSummary }) {
  const maxGrade = gradesSummary.graph_upper_limit
  const myGrade = gradesSummary.current_user_grade
  const showNumberOnBars = gradesSummary.show_number_on_bars
  const showDashedLine = gradesSummary.show_dash_line
  const margin = { top: 20, right: 20, bottom: 50, left: 40 }
  const barColor = siteTheme.palette.secondary.main
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  // data usually will be [50.6, 50.6, 50.6, 50.6, 50.6, 74.28, 74.52, 75.89, 76.69,,.,.,.,.] lowest grades binned
  //  to hide low performers.

  // the set operation removes duplicates
  const tempUniqData = [...new Set(data)]

  const firstGradeAfterBinnedGrade = tempUniqData[1]
  /* only showing the tick values above the binned grades eg, with above data the tick will start from 75%
  * if course has 0% or > 95% grades then we just show the whole distribution
  * */
  const minTickGrade = showDashedLine ? Math.round(firstGradeAfterBinnedGrade / 5) * 5 : 0

  const x = d3.scaleLinear()
    .domain([0, maxGrade]).nice()
    .range([margin.left, aWidth - margin.right])

  const bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(40))(data)

  const narrativeText = {}

  const isBinningUsed = new Set(data.slice(0, 5)).size === 1
  narrativeText.courseStats = `Course information: Number of students = ${gradesSummary.tot_students}, Average grade = ${gradesSummary.grade_avg}, Median grade = ${gradesSummary.median_grade}.`
  narrativeText.binnedGradeText = isBinningUsed ? ` First grades are binned at ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower.` : ''
  narrativeText.courseGrades = []
  for (const gradeBin in bins) {
    if (bins[gradeBin].length > 0) {
      const binLowerLimit = bins[gradeBin].x0
      const binUpperLimit = bins[gradeBin].x1
      if (isInRange(myGrade, binLowerLimit, binUpperLimit) && showGrade) {
        narrativeText.courseGrades.push(`${(narrativeText.courseGrades.length !== 0)
          ? `${bins[gradeBin].length} in ${binLowerLimit} - ${binUpperLimit}% and your grade ${myGrade}% is in this range`
          : `${bins[gradeBin].length} grades in ${binLowerLimit} - ${binUpperLimit}% range and your grade ${myGrade}% is in this range`}`)
      } else {
        narrativeText.courseGrades.push(`${(narrativeText.courseGrades.length !== 0
          ? `${bins[gradeBin].length} in ${binLowerLimit} - ${binUpperLimit}% `
          : `${bins[gradeBin].length} grades in ${binLowerLimit} - ${binUpperLimit}%`)}`)
      }
    }
  }

  // getting the first bin that has some grades in them, accessing the x1(higher bin) value
  const dashLine = () => {
    for (const bin in bins) {
      if (bins[bin].length > 0) {
        return bins[bin].x1
      }
    }
  }

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([aHeight - margin.bottom, margin.top])

  const main = d3.select(domElement).append('div')

  // eslint-disable-next-line no-unused-vars
  const desp = main.append('div')
    .attr('aria-live', 'polite')
    .attr('id', 'grade-view-narrative')
    .attr('class', 'screenreader-only sr-only')
    .text(d => {
      return narrativeText.courseStats.concat(narrativeText.binnedGradeText, narrativeText.courseGrades.toString())
    })

  const svg = main.append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)
    .attr('aria-describedby', 'grade-view-narrative')
    .attr('role', 'img')
    .attr('aria-labelledby', 'Grade-view-title-id')

  svg.append('svg:title')
    .attr('id', 'Grade-view-title-id')
    .text(d => 'Grade distribution SVG Graph')

  const bar = svg.selectAll('rect')
    .data(bins).enter()
    .append('g')

  bar.append('rect')
    .attr('x', d => x(d.x0) + 1)
    .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr('y', d => y(d.length))
    .attr('height', d => y(0) - y(d.length))
    .attr('fill', barColor)

  // Default is not show count on bar text, in case of AB testing a feature we want to leave it a configurable option
  if (showNumberOnBars) {
    bar.append('text')
      .attr('x', d => x((d.x1 + d.x0) / 2))
      .attr('y', d => y(d.length) + margin.top - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .text(d => d.length === 0 ? '' : d.length)
  }

  const xAxis = g => g
    .attr('transform', `translate(0, ${aHeight - margin.bottom})`)
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
      .attr('line-height', '1.46429em')
      .text(xAxisLabel).attr('dy', -4)
    )
    .call(g => g.selectAll('.tick').filter(d => d < minTickGrade).remove())

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
      .attr('line-height', '1.46429em')
      .attr('opacity', 1)
      .attr('text-anchor', 'start')
      .text(yAxisLabel).attr('dy', -4))

  svg.append('g')
    .call(xAxis)

  svg.append('g')
    .call(yAxis)

  if (showGrade) {
    svg.append('line')
      .attr('transform', `translate(0, ${aHeight - margin.bottom})`)
      .attr('x1', x(myGrade))
      .attr('y1', -aHeight + 75)
      .attr('x2', x(myGrade))
      .attr('y2', 0)
      .attr('stroke', 'darkorange')
      .attr('stroke-width', '2')
    svg.append('text')
      .attr('x', myGrade < 5 ? x(myGrade) + 3 : x(myGrade) - 120)
      .attr('y', margin.top + 15)
      .text(`My Grade: ${roundToXDecimals(myGrade, 1)}%`)
      .attr('font-size', '0.875rem')
      .attr('font-weight', 'bold')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
  }
  // Dashed line to show difference b/w binned and normal distribution
  if (showDashedLine) {
    svg.append('line')
      .attr('transform', `translate(0, ${aHeight - margin.bottom})`)
      .attr('x1', x(dashLine()))
      .attr('y1', -aHeight)
      .attr('x2', x(dashLine()))
      .attr('y2', 0)
      .attr('stroke-dasharray', ('3, 3'))
      .attr('stroke', 'rgba(0, 0, 0, 0.54)')
    svg.append('text')
      .attr('x', x(dashLine()) - 40)
      .attr('y', margin.top - 5)
      .text(`<${Math.trunc(firstGradeAfterBinnedGrade)}%`)
      .attr('font-size', '0.875rem')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
      .attr('fill', 'rgba(0, 0, 0, 0.54)')
  }
}

export default createHistogram
