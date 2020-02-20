import React from 'react'
import Typography from '@material-ui/core/Typography'
import '@fortawesome/fontawesome-free'

function IconLabel(props) {
  const {
    icon,
    label
  } = props

  return (
    <Typography><i style={{fontSize: '1em', padding:'5px 10px 5px 5px'}} class={icon}></i>{label}</Typography>
  )
}

export default IconLabel