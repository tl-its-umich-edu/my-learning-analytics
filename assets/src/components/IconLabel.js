import React from 'react'

function IconLabel (props) {
  const {
    icon, // font-awesome class name
    label
  } = props

  return (
    <p><i style={{ fontSize: '14px', padding: '5px 10px 5px 5px' }} className={icon} />{label}</p>
  )
}

export default IconLabel
