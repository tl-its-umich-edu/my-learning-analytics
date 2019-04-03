import React, { memo, useState } from 'react'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const createSliderWithTooltip = Slider.createSliderWithTooltip
const SliderWithTip = createSliderWithTooltip(Slider)
const Handle = Slider.Handle

const handle = props => {
  const { value, index, dragging, ...restProps } = props
  return (
    <Tooltip
      prefixCls='rc-slider-tooltip'
      overlay={value}
      visible={dragging}
      placement='top'
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  )
}

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
      handle={handle}
      tipFormatter={value => `${value}%`}
      marks={{ 50: '50%', 100: '100%' }}
    />
  )
}

export default GradeSlider
