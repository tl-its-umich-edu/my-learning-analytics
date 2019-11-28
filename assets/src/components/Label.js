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
        left,
        zIndex: 1,
        top: labelPlacement === 'down'
          ? '50px'
          : labelPlacement === 'downLower'
            ? '75px'
            : labelPlacement === 'up'
              ? '-20px'
              : 0
      }}
    >
      {labelText}
    </div>
  )
}

export default Label
