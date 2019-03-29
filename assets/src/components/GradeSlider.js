import React, { useState } from 'react'
// import Slider from '@material-ui/lab/Slider'
import { Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import 'rc-slider/assets/index.css'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded, weight, actualGrade } = props
  const [sliderValue, setSliderValue] = useState(grade)

  return (
    <>
      <Grid container spacing={16}>
        <Grid item xs={6}>
          <Typography
            align={'left'}
            style={{ paddingBottom: '10px' }}
            variant='caption'>
            Weight: {`${weight}%`}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography
            align={'right'}
            style={{ paddingBottom: '10px' }}>
            {isGraded ? `${actualGrade}%` : `${sliderValue}%`}
          </Typography>
        </Grid>
      </Grid>
      <Slider
        defaultValue={sliderValue}
        min={0}
        max={100}
        step={1}
        onChange={value => setSliderValue(value)}
        onAfterChange={() => setWhatIfGrade(sliderValue)}
        disabled={isGraded}
      />
    </>
  )
}

export default GradeSlider
