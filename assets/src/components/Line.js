import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const {
    height,
    left,
    color,
    width = 2,
    labelPlacement // Value should be one of 'up1', 'down1', and 'down2'.  1 or 2 represents an aproximation of lines of text of offset up or down.
  } = props

  const lineHeight = labelPlacement === 'up1' || labelPlacement === 'down1'
    ? height + 25
    : labelPlacement === 'down2'
      ? height + 42
      : height + 2

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        width: `${width}px`,
        backgroundColor: color,
        height: `${lineHeight}px`,
        left,
        zIndex: 1,
        marginTop: labelPlacement === 'up1' ? '-25px' : 0,
        marginBottom: labelPlacement === 'down1' ||
          labelPlacement === 'down2' ? '-25px' : 0
      }}
      // ref={drag}
    />
  )
}

export default Line
