import React, { memo } from 'react'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const createSliderWithTooltip = Slider.createSliderWithTooltip
const SliderWithTip = createSliderWithTooltip(Slider)
const Handle = Slider.Handle

const handle = props => {
  const { value, dragging, index, ...restProps } = props
  return (
    <Tooltip
      prefixCls='rc-slider-tooltip'
      overlay={value}
      visible
      placement='top'
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  )
}

function GradeSlider (props) {
  const { grade, setWhatIfGrade, isGraded } = props

  return (
    <SliderWithTip
      value={grade}
      min={0}
      max={100}
      step={1}
      onAfterChange={value => setWhatIfGrade(value)}
      disabled={isGraded}
      handle={handle}
      tipFormatter={value => `${value}%`}
      marks={{ 50: '50%', 100: '100%' }}
    />
  )
}

export default memo(GradeSlider)
