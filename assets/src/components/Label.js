import React from 'react'

function Label (props) {
  const {
    left,
    color,
    labelPlacement,
    labelText
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        left: labelPlacement === 'down'
          ? `calc(${left} - 115px)`
          : left,
        zIndex: 1,
        top: labelPlacement === 'down'
          ? '55px'
          : labelPlacement === 'downLower'
            ? '75px'
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
