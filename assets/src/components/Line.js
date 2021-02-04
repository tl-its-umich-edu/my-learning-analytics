import React from 'react'

import Label from './Label'
import { roundToXDecimals } from '../util/math'

const determineVisualXPercent = (value, maxValue) => {
  if (value > maxValue) return maxValue
  if (value < 0) return 0
  return value / maxValue * 100
}

const getVerticalStyles = (barHeight, placement) => {
  const verticalUnit = 25
  const textHeight = 16

  switch (placement) {
    case 'up1':
      return {
        lineHeight: `${barHeight + verticalUnit}px`,
        lineMarginTop: `-${verticalUnit}px`,
        lineMarginBottom: '0',
        labelZIndex: '3',
        labelTop: `-${verticalUnit}px`
      }
    case 'down1':
      return {
        lineHeight: `${barHeight + verticalUnit}px`,
        lineMarginTop: '0',
        lineMarginBottom: `-${verticalUnit}px`,
        labelZIndex: '2',
        labelTop: `${barHeight + verticalUnit - textHeight}px`
      }
    case 'down2':
      return {
        lineHeight: `${barHeight + (verticalUnit * 2)}px`,
        lineMarginTop: '0',
        lineMarginBottom: `-${verticalUnit}px`,
        labelZIndex: '1',
        labelTop: `${barHeight + (verticalUnit * 2) - textHeight}px`
      }
    default:
      return {
        lineHeight: barHeight,
        lineMarginTop: '0',
        lineMarginBottom: '0',
        labelZIndex: '0',
        labelTop: '0'
      }
  }
}

function Line (props) {
  const {
    value,
    outOf,
    barHeight,
    color,
    width = 2,
    placement, // Value should be one of 'up1', 'down1', and 'down2'.  1 or 2 represents an approximation of lines of text of offset up or down.
    label = undefined
  } = props

  const verticalStyles = getVerticalStyles(barHeight, placement)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          display: 'inline-block',
          width: `${width}px`,
          backgroundColor: color,
          height: verticalStyles.lineHeight,
          left: `${determineVisualXPercent(value, outOf)}%`,
          zIndex: 1,
          marginTop: verticalStyles.lineMarginTop,
          marginBottom: verticalStyles.lineMarginBottom
        }}
      />
      {
        label && (
          <Label
            labelText={`${label}: ${roundToXDecimals(value, 1)}%`}
            color={color}
            visualXPercent={determineVisualXPercent(value, outOf)}
            top={verticalStyles.labelTop}
            zIndex={verticalStyles.labelZIndex}
          />
        )
      }
    </>
  )
}

export default Line
