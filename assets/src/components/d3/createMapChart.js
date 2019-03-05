import * as d3 from 'd3'
import { adjustViewport } from '../../util/chart'
import { margin } from '../../constants/chartConstants'

function createMapChart ({ data, width, height, el, tip }) {
  const [aWidth, aHeight] = adjustViewport(width, height, margin)

  const svg = d3.select(el).append('svg')
    .attr('width', aWidth)
    .attr('height', aHeight)

  const mapData = data.mapChartData
  const heatmapPopulation = data.heatmapData.countries
  mapData.features.forEach(country => {
    const nameOfCountry = country.properties.name
    const countryPopulation = heatmapPopulation.find(({ name }) => nameOfCountry === name)
    if (countryPopulation) {
      country.properties.population = countryPopulation.population
    } else {
      country.properties.population = 0
    }
    return country
  })

  const projection = d3
    .geoMercator()
    .fitExtent([[0, 0], [aWidth, aHeight * 1.5]], mapData)

  const path = d3.geoPath()
    .projection(projection)

  const domain = [0.125, Math.max(...mapData.features.map(x => x.properties.population))]

  const color = d3.scaleLog()
    .base(2)
    .domain(domain)
    .interpolate(() => d3.interpolateMagma)

  const map = svg.selectAll('path')
    .data(mapData.features).enter()
    .append('path')
    .attr('fill', d => color(d.properties.population))
    .attr('d', path)

  if (tip) {
    svg.call(tip)
    map
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  }
}

export default createMapChart
