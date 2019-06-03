import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import HelpIcon from '@material-ui/icons/HelpOutline'
import SettingsIcon from '@material-ui/icons/Settings'

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
    marginRight: 'auto'
  }
})

function AvatarModal (props) {
  const { classes, user } = props

  const [helpURL, setHelpURL] = useState('https://sites.google.com/umich.edu/my-learning-analytics-help/home')
  const url = window.location.href

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
            {user.firstName.slice(0, 1)}{user.lastName.slice(0, 1)}
          </Avatar>
        </Grid>
        <Grid item xs={8} container direction='column'>
          <Typography
            className={classes.typography}
            variant='subtitle2'>
            {`${user.firstName} ${user.lastName}`}
          </Typography>
          <Typography variant='subtitle2'>{user.email}</Typography>
        </Grid>
        <Grid item xs={12}>
          <List>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText inset primary='Help' onClick={() => (window.location.href = helpURL)} />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText inset primary='Settings' />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText inset primary='Logout' onClick={() => (window.location.href = `${window.location.hostname}:${window.location.port}/accounts/logout`)} />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AvatarModal)
