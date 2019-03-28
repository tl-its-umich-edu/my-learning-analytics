import React, { useState } from 'react'
import Slider from '@material-ui/lab/Slider'
import { Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded, weight } = props
  const [sliderValue, setSliderValue] = useState(grade)

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <Typography
            align={'left'}
            style={{ paddingBottom: '10px' }}
            variant='caption'>
            Weighting: {`${weight}%`}
          </Typography>
        </Grid>
        {!isGraded
          ? <Grid item xs={6}>
            <Typography
              align={'right'}
              style={{ paddingBottom: '10px' }}>
              {`${sliderValue}%`}
            </Typography>
          </Grid> : null}
      </Grid>
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
