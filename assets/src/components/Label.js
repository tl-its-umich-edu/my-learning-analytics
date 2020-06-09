import React from 'react'

const alignThreshold = 25

const getLeft = (value) => {
  const left = value > alignThreshold ? '0' : value + '%'
  return left
}

const getRight = (value) => {
  const right = value > alignThreshold ? value + '%' : ''
  return right
}

const getWidth = (value) => {
  return value > alignThreshold ? value + '%' : ''
}

const getTextAlign = (value) => {
  return value > alignThreshold ? 'right' : 'left'
}

function Label (props) {
  const {
    value,
    color,
    labelPlacement, // Value should be one of 'up1', 'down1', and 'down2'.  1 or 2 represents an aproximation of lines of text of offset up or down.
    labelText
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        width: `${getWidth(value)}`,
        textAlign: `${getTextAlign(value)}`,
        left: `${getLeft(value)}`,
        right: `${getRight(value)}`,
        zIndex: labelPlacement === 'up1'
          ? '3'
          : labelPlacement === 'down1'
            ? '2'
            : labelPlacement === 'down2'
              ? '1'
              : '0',
        top: labelPlacement === 'up1'
          ? '-25px'
          : labelPlacement === 'down1'
            ? '55px'
            : labelPlacement === 'down2'
              ? '75px'
              : 0
      }}
    >
      &nbsp;{labelText}&nbsp;
    </div>
  )
}

export default Label
