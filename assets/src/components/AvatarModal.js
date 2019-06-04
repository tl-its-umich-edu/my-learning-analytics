import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import Link from '@material-ui/core/Link'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import HelpIcon from '@material-ui/icons/HelpOutline'
import Lock from '@material-ui/icons/Lock'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  typography: {
    marginTop: theme.spacing.unit * 2
  },
  avatar: {
    padding: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
    marginLeft: 0
  }
})

function AvatarModal(props) {
  const { classes, user } = props

  const url = window.location.href
  const [helpURL, setHelpURL] = useState('https://sites.google.com/umich.edu/my-learning-analytics-help/home')
  const [logoutURL, setLogoutURL] = useState(`${window.location.origin}/accounts/logout/`)

  useEffect(() => {
    const helpUrlContext = url.includes('grades')
      ? '/grade-distribution'
      : url.includes('assignment')
        ? '/assignment-planning'
        : url.includes('file')
          ? '/files-accessed'
          : ''
    setHelpURL(`${helpURL}${helpUrlContext}`)
  }, [url])

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={4}>
          <Avatar className={classes.avatar}>
            {user.username.slice(0, 1)}
          </Avatar>
        </Grid>
        <Grid item xs={8} container direction='column'>
          <Typography
            className={classes.typography}
            variant='subtitle2'>
            {user.username}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <List>
            <Divider />
            <Link style={{ textDecoration: 'none' }} href={helpURL}>
              <ListItem button>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText inset primary='Help' />
              </ListItem>
            </Link>
            <Divider />
            {
              user.admin
                ?
                <>
                  <Link style={{ textDecoration: 'none' }} href={`${window.location.origin}/admin`}>
                    <ListItem button>
                      <ListItemIcon>
                        <Lock />
                      </ListItemIcon>
                      <ListItemText inset primary='Admin' />
                    </ListItem>
                  </Link>
                  <Divider />
                </>
                : null
            }
            <Link style={{ textDecoration: 'none' }} href={logoutURL}>
              <ListItem button>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText inset primary='Logout' style={{ marginLeft: 0 }} />
              </ListItem>
            </Link>
          </List>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AvatarModal)
