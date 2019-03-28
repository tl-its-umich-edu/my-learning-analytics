import React, { useState } from 'react'
import Slider from '@material-ui/lab/Slider'
import { Typography } from '@material-ui/core'

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded } = props
  const [sliderValue, setSliderValue] = useState(grade)

  return (
    <>
      <Typography
        align={'right'}
        style={{ paddingBottom: '10px' }}>
        {isGraded ? null : `${sliderValue}%`}
      </Typography>
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
    </>
  )
}

export default GradeSlider
