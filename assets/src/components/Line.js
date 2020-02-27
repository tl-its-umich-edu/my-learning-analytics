import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const {
    height,
    left,
    color,
    width = 2,
    labelPlacement
  } = props

  // const [{ isDragging }, drag] = useDrag({
  //   item: { id: key, type: 'line' },
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging()
  //   })
  // })

  const lineHeight = labelPlacement === 'up' || labelPlacement === 'down'
    ? height + 25
    : labelPlacement === 'downLower'
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
        marginTop: labelPlacement === 'up' ? '-25px' : 0,
        marginBottom: labelPlacement === 'down' ||
          labelPlacement === 'downLower' ? '-25px' : 0
      }}
      // ref={drag}
    />
  )
}

export default Line
