import React, { useState } from 'react'
import Slider from '@material-ui/lab/Slider'

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded } = props
  const [sliderValue, setSliderValue] = useState(grade)

  return (
    <Slider
      value={sliderValue}
      min={0}
      max={100}
      step={1}
      aria-labelledby='label'
      onChange={(_, value) => setSliderValue(value)}
      onDragEnd={() => setWhatIfGrade(sliderValue)}
      disabled={isGraded}
    />
  )
}

export default GradeSlider
