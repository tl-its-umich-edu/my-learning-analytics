import React from 'react'
import '@fortawesome/fontawesome-free'

function IconLabel (props) {
  const {
    icon,
    label
  } = props

  return (
    <p><i style={{ fontSize: '14px', padding: '5px 10px 5px 5px' }} className={icon} />{label}</p>
  )
}

export default IconLabel
