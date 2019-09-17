import React from 'react'
// import { useDrag } from 'react-dnd'

function Line (props) {
  const { height, left, color, key } = props

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
        width: '2px',
        backgroundColor: color,
        height,
        left
      }}
      key={key}
      // ref={drag}
    />
  )
}

export default Line
