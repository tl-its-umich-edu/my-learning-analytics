import React, { useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const createSliderWithTooltip = Slider.createSliderWithTooltip
const SliderWithTip = createSliderWithTooltip(Slider)

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded } = props

  const [sliderGrade, setSliderGrade] = useState(grade)

  return (
    <SliderWithTip
      value={grade}
      min={0}
      max={100}
      step={1}
      onAfterChange={() => setWhatIfGrade(sliderGrade)}
      onChange={value => setSliderGrade(value)}
      disabled={isGraded}
      tipFormatter={value => `${value}%`}
      marks={{ 50: '50%', 100: '100%' }}
    />
  )
}

export default GradeSlider
