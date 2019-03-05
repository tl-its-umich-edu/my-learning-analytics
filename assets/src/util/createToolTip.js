import d3tip from 'd3-tip'

const createToolTip = html => d3tip()
  .html(html)

export default createToolTip
