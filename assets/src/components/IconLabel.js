import React from 'react'
import { styled } from '@mui/material/styles'
import { Typography } from '@mui/material'

const PREFIX = 'IconLabel'

const classes = {
  typography: `${PREFIX}-typography`,
  icon: `${PREFIX}-icon`
}

const StyledTypography = styled(Typography)(() => ({
  [`&.${classes.typography}`]: {
    marginLeft: '5px',
    marginRight: '5px'
  },

  [`& .${classes.icon}`]: {
    fontSize: '16px',
    paddingRight: '10px'
  }
}))

function IconLabel (props) {
  const {
    icon, // font-awesome class name
    label
  } = props

  return (
    <StyledTypography className={classes.typography}>
      <i className={`${icon} ${classes.icon}`} />{label}
    </StyledTypography>
  )
}

export default (IconLabel)
