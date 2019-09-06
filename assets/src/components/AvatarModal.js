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
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import LogoutIcon from '@material-ui/icons/ExitToApp'
import HelpIcon from '@material-ui/icons/HelpOutline'
import Lock from '@material-ui/icons/Lock'
import Launch from '@material-ui/icons/Launch'

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
  },
  link: {
    textDecoration: 'none',
    marginLeft: 0
  }
})

function AvatarModal (props) {
  const { classes, user } = props

  const url = window.location.href
  const logoutURL = '/accounts/logout'

  const [helpURL, setHelpURL] = useState('https://sites.google.com/umich.edu/my-learning-analytics-help/home')
  const [openChangeCourseDialog, setOpenChangeCourseDialog] = useState(false)

  const Admin = () => (
    <>
      <Link style={{ textDecoration: 'none' }} href='/admin'>
        <ListItem button>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText inset primary='Admin' />
        </ListItem>
      </Link>
      <Divider />
    </>
  )

  const SwitchCourses = () => (
    <>
      <ListItem button onClick={() => setOpenChangeCourseDialog(true)}>
        <ListItemIcon>
          <Launch />
        </ListItemIcon>
        <ListItemText inset primary='Switch courses' style={{ marginLeft: 0 }} />
      </ListItem>
      <Dialog
        onClose={() => setOpenChangeCourseDialog(false)}
        open={openChangeCourseDialog}>
        <DialogTitle>Select a course</DialogTitle>
        <List>
          {user.enrolledCourses.map((course, i) => (
            <Link
              style={{ textDecoration: 'none' }}
              href={`/courses/${course.course_id}`}
              key={i}>
              <ListItem button>
                <ListItemText inset primary={course.course_name} style={{ marginLeft: 0 }} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Dialog>
      <Divider />
    </>
  )

  useEffect(() => {
    const helpUrlContext = url.includes('grades')
      ? '/grade-distribution'
      : url.includes('assignment')
        ? '/assignment-planning'
        : url.includes('resources')
          ? '/resources-accessed'
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
          <Typography className={classes.typography}>
            Signed in as
          </Typography>
          <Typography
            className={classes.typography}
            variant='subtitle1'
            style={{ marginTop: 0 }}>
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
                ? Admin()
                : null
            }
            {
              user.enrolledCourses.length > 1
                ? SwitchCourses()
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
