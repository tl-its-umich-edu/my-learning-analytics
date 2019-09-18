import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const {
    height,
    left,
    color,
    width = '2',
    labelUp,
    labelDown
  } = props

  // const [{ isDragging }, drag] = useDrag({
  //   item: { id: key, type: 'line' },
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging()
  //   })
  // })

  const lineHeight = labelUp || labelDown
    ? height + 20
    : height

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
        marginBottom: labelDown ? '-20px' : 0
      }}
      // ref={drag}
    />
  )
}

export default Line
