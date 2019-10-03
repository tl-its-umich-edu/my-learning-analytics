import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const {
    height,
    left,
    color,
    width = '2',
    labelUp,
    labelDown,
    labelDownLower
  } = props

  // const [{ isDragging }, drag] = useDrag({
  //   item: { id: key, type: 'line' },
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging()
  //   })
  // })

  const lineHeight = labelUp || labelDown
    ? height + 20
    : labelDownLower
      ? height + 50
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
        marginTop: labelUp ? '-20px' : 0,
        marginBottom: labelDown || labelDownLower ? '-20px' : 0
      }}
      // ref={drag}
    />
  )
}

export default Line
