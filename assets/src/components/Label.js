import React from 'react'

function Label (props) {
  const {
    left,
    color,
    labelPlacement,
    labelText,
    extraLineHeight
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        left,
        zIndex: labelPlacement === 'down'
          ? '2'
          : labelPlacement === 'downLower'
            ? '1'
            : labelPlacement === 'up'
              ? '3'
              : 0,
        top: labelPlacement === 'down'
          ? '55px'
          : labelPlacement === 'downLower'
            ? 75 + +extraLineHeight + 'px'
            : labelPlacement === 'up'
              ? '-25px'
              : 0
      }}
    >
      {labelText}
    </div>
  )
}

export default Label
