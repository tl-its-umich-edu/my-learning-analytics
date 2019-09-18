import React from 'react'

function Label (props) {
  const {
    left,
    color,
    labelUp,
    labelDown,
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
        marginTop: labelUp ? '-20px' : 0,
        marginBottom: labelDown ? '-20px' : 0
      }}
    >
      {labelText}
    </div>
  )
}

export default Label
