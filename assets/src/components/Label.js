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
        width: undefined,
        textAlign: 'left'
      }
  )
}

function Label (props) {
  const {
    labelText,
    color,
    visualXPercent,
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
        zIndex,
        ...getHorizontalStyles(visualXPercent)
      }}
    >
      &nbsp;{labelText}&nbsp;
    </div>
  )
}

export default Label
