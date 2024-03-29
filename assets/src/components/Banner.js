import React from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

const PREFIX = 'Banner'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    flexGrow: 1,
    padding: 8
  },

  [`& .${classes.paper}`]: {
    align: 'center',
    padding: theme.spacing(2),
    opacity: 0.9,
    boxShadow:
            '0px 2px 4px -1px rgba(0,0,0,0.2), ' +
            '0px 4px 5px 0px rgba(0,0,0,0.14), ' +
            '0px 1px 10px 0px rgba(0,0,0,0.12)'
  }
}))

function Banner (props) {
  const { settings, children } = props

  const paperStyle = {
    background: settings.backgroundColor,
    borderColor: settings.borderColor
  }

  const typographyStyle = {
    color: settings.textColor,
    fontSize: '1.0rem',
    textAlign: 'center'
  }

  return (
    <Root className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper} style={paperStyle}>
            <Typography style={typographyStyle} gutterBottom>
              {children}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Root>
  )
}

export default (Banner)
