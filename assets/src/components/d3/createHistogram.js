import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { roundToOneDecimal } from '../../util/math'

function createHistogram ({ data, width, height, domElement, xAxisLabel, yAxisLabel, myGrade, maxGrade = 100,
                            showNumberOnBars}) {
  const margin = { top: 20, right: 20, bottom: 50, left: 40 }
  const [aWidth, aHeight] = adjustViewport(width, height, margin)
  // data usually will [60, 60, 60, 60, 60, 74.28, 74.52, 75.89, 76.69,,.,.,.,.] the first 5 will be binning grades
  // the set operation removes duplicates
  const tempUniqData = [... new Set(data)]
  const binningGrade = tempUniqData[0]
  const firstGradeAfterBinnedGrade = tempUniqData[1]
  /* only showing the tick values above the binned grades eg, with above data the tick will start from 75%
  * if course has 0% grades then we just show the whole distribution
  * */

  const minTickGrade = tempUniqData.includes(0)?0:Math.round(firstGradeAfterBinnedGrade/5)*5
  console.log(data)
  console.log(tempUniqData)

  /*if a student MyGrades is in binned distribution but his actual grade is between binned and normal distribution
  * we don't want to show his line in between since there won't be any bar in that gap due to the binning logic so we position
  * the MyGrade line to the lowest bin bar. If the MyGrade is below min grade data then we will show the MyGrade Line
  * as is
  * */
  const myGradeLinePosition = (myGrade)=>{
    if(myGrade > binningGrade && myGrade < firstGradeAfterBinnedGrade){
      return binningGrade+1
    }
    return myGrade
  }

  const x = d3.scaleLinear()
    .domain([0, maxGrade]).nice()
    .range([margin.left, aWidth - margin.right])


  const bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(40))(data)


  const binWidth = Math.max(0,x(bins[4].x1)-x(bins[4].x0)-1 )

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([aHeight - margin.bottom, margin.top])
  console.log(y.domain())
  console.log(x.domain())

  const svg = d3.select(domElement).append('svg')
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

  const firstTick = svg.selectAll('.tick:first-of-type text')
  console.log(firstTick._groups[0][0].innerHTML)

  svg.append('g')
    .call(yAxis)

  if (myGrade) {
    svg.append('line')
      .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
      .attr('x1', x(myGradeLinePosition(myGrade)))
      .attr('y1', -aHeight + 75)
      .attr('x2', x(myGradeLinePosition(myGrade)))
      .attr('y2', 0)
      .attr('stroke', 'darkorange')
      .attr('stroke-width', '2')
    svg.append('text')
      .attr('x', x(myGradeLinePosition(myGrade)))
      .attr('y', margin.top + 15)
      .text(`My Grade:${roundToOneDecimal(myGrade)}%`)
      .attr('font-size', '0.875rem')
      .attr('font-weight', 'bold')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
  }

  if (binningGrade !== 0.0) {
    svg.append('line')
      .attr(`transform`, `translate(0, ${aHeight - margin.bottom})`)
      .attr('x1', x(binningGrade) + binWidth)
      .attr('y1', -aHeight)
      .attr('x2', x(binningGrade) + binWidth)
      .attr('y2', 0)
      .attr('stroke-dasharray', ('3, 3'))
      .attr('stroke', 'rgba(0, 0, 0, 0.54)')
    svg.append('text')
      .attr('x', x(binningGrade) - 12)
      .attr('y', margin.top - 5)
      .text(`<${Math.trunc(firstGradeAfterBinnedGrade)}%`)
      .attr('font-size', '0.875rem')
      .attr('line-height', '1.46429em')
      .attr('text-anchor', 'start')
      .attr('fill', 'rgba(0, 0, 0, 0.54)')
  }

}


export default createHistogram
