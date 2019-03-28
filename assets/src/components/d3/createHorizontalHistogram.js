import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'
import React from 'react'

function createHorizontalHistogram ({ data, width, height, el, xAxisLabel, yAxisLabel }) {
    data = data.sort((a, b) => a.total_count - b.total_count)
    const margin = { top: 0, bottom: 20, left: 100, right: 10 }
    const [svgWidth, svgHeight] = [width, height];

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data.map(d => d.total_count))]).nice()
        .range([margin.left, svgWidth - margin.right])

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.file_name))
        .range([svgHeight - margin.bottom, margin.top])
        .padding(0.1)

    const x_axis = d3.axisBottom()
        .scale(xScale)

    const y_axis = d3.axisLeft()
        .scale(yScale)

    const svg = d3.select(el).append('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight)

    svg.append("g")
        .attr("transform", `translate(0, 460)`)
        .call(x_axis)

    svg.append("g")
        .attr("transform", "translate(100, 0)")
        .call(y_axis)

    const barChart = svg.selectAll("rect")
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'barChart')
        .attr('x', d => xScale(0))
        .attr('width', d => xScale(d.total_count) - xScale(0))
        .attr('y', d => yScale(d.file_name))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => d.self_access_count == 0 ? 'grey' : 'steelblue')
}

export default createHorizontalHistogram;