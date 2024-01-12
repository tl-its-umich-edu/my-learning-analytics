import React from 'react'

const getHorizontalStyles = (value) => {
  const alignThreshold = 25
  return (
    value > alignThreshold
      ? {
          left: '0',
          right: value + '%',
          width: value + '%',
          textAlign: 'right'
        }
      : {
          left: value + '%',
          right: '0',
          width: '',
          textAlign: 'left'
        }
  )
}

function Label (props) {
  const {
    labelText,
    color,
    visualPercent,
    top,
    zIndex
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        top,
        lineHeight: '90%',
        zIndex,
        ...getHorizontalStyles(visualPercent)
      }}
    >
      &nbsp;{labelText}&nbsp;
    </div>
  )
}

export default Label
