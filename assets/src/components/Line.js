import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const { height, left, color, width = '2px' } = props

  // const [{ isDragging }, drag] = useDrag({
  //   item: { id: key, type: 'line' },
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging()
  //   })
  // })

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        width,
        backgroundColor: color,
        height,
        left
      }}
      // ref={drag}
    />
  )
}

export default Line
