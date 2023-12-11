import React from 'react'
import 'rc-slider/assets/index.css'
import Slider, { Range } from 'rc-slider'
import { siteTheme } from '../globals'

const rangeSlider = props => {
  const activeDotStyle = {
    borderColor: siteTheme.palette.secondary.main
  }
  const dotStyle = {
    borderColor: siteTheme.palette.negative.main
  }
  const unselectedStyle = {
    borderColor: siteTheme.palette.negative.main,
    backgroundColor: siteTheme.palette.negative.main
  }
  const selectedStyle = {
    borderColor: siteTheme.palette.secondary.main,
    backgroundColor: siteTheme.palette.secondary.main
  }
  const wrapperStyle = { width: '70%', margin: '0 auto' }

  const marks = {}
  for (let week = props.min; week <= props.max; week++) {
    if (week === props.curWeek) {
      marks[week] = `${week} (now)`
    } else {
      marks[week] = `${week}`
    }
  }
  return (
    <div style={wrapperStyle}>
      <p style={{ textAlign: 'center' }}>Select a start and end week</p>
      <Slider
        range
        activeDotStyle={activeDotStyle}
        dotStyle={dotStyle}
        handleStyle={[activeDotStyle, activeDotStyle]}
        railStyle={unselectedStyle}
        trackStyle={[selectedStyle]}
        allowCross={false}
        min={props.min}
        max={props.max}
        onChange={props.onWeekChange}
        defaultValue={[props.startWeek, props.endWeek]}
        marks={marks}
      />
    </div>
  )
}

export default rangeSlider
