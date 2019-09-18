import React from 'react'

function Label (props) {
  const {
    color,
    labelUp,
    labelDown
  } = props

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        color,
        zIndex: 1
      }}
    />
  )
}

export default Label
