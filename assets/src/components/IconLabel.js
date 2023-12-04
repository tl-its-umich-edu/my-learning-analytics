import React from 'react'
import { Typography } from '@mui/material'

import withStyles from '@mui/styles/withStyles'

const styles = () => ({
  typography: {
    marginLeft: '5px',
    marginRight: '5px'
  },
  icon: {
    fontSize: '16px',
    paddingRight: '10px'
  }
})

function IconLabel (props) {
  const {
    classes,
    icon, // font-awesome class name
    label
  } = props

  return (
    <Typography className={classes.typography}>
      <i className={`${icon} ${classes.icon}`} />{label}
    </Typography>
  )
}

export default withStyles(styles)(IconLabel)
