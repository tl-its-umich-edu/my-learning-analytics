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
import { viewHelpURLs } from '../globals'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  typography: {
    marginTop: theme.spacing(2)
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
  },
  text: {
    paddingLeft: 0,
    color: 'black'
  }
})

function AvatarModal (props) {
  const { classes, user } = props

  const url = window.location.href

  const [helpURL, setHelpURL] = useState(user.helpURL)
  const [openChangeCourseDialog, setOpenChangeCourseDialog] = useState(false)

  const Admin = () => (
    <>
      <Link style={{ textDecoration: 'none' }} href='/admin'>
        <ListItem button>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText inset primary='Admin' className={classes.text} />
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
        <ListItemText inset primary='Switch courses' className={classes.text} />
      </ListItem>
      <Dialog
        onClose={() => setOpenChangeCourseDialog(false)}
        open={openChangeCourseDialog}
      >
        <DialogTitle>Select a course</DialogTitle>
        <List>
          {user.relatedCourses.map((course, i) => (
            <Link
              style={{ textDecoration: 'none' }}
              href={`/courses/${course.course_id}`}
              key={i}
            >
              <ListItem button>
                <ListItemText inset primary={course.course_name} className={classes.text} />
              </ListItem>
            </Link>
          ))}
        </List>
      </Dialog>
      <Divider />
    </>
  )

  useEffect(() => {
    const getContextHelpUrl = (url) => {
      let target
      if (url.includes('grades')) {
        target = viewHelpURLs.gd
      } else if (url.includes('assignments')) {
        target = viewHelpURLs.ap
      } else if (url.includes('resources')) {
        target = viewHelpURLs.ra
      } else {
        target = viewHelpURLs.home
      }
      return target || viewHelpURLs.home
    }
    // In the case no help is defined, use the default help page which *should* be
    setHelpURL(getContextHelpUrl(url))
  }, [url])

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={4}>
          <Avatar className={classes.avatar}>
            {user.initials}
          </Avatar>
        </Grid>
        <Grid item xs={8} container direction='column'>
          <Typography className={classes.typography}>
            Signed in as
          </Typography>
          <Typography
            className={classes.typography}
            variant='subtitle1'
            style={{ marginTop: 0 }}
          >
            {user.displayName}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <List>
            <Divider />
            <Link style={{ textDecoration: 'none' }} href={helpURL} target='_blank' rel='noopener'>
              <ListItem button>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText inset primary='Help' className={classes.text} />
              </ListItem>
            </Link>
            <Divider />
            {
              user.admin
                ? Admin()
                : null
            }
            {
              user.relatedCourses.length > 1
                ? SwitchCourses()
                : null
            }
            {
              user.logoutURL !== ''
                ? (
                  <Link style={{ textDecoration: 'none' }} href={user.logoutURL}>
                    <ListItem button>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText inset primary='Logout' className={classes.text} />
                    </ListItem>
                  </Link>
                )
                : null
            }
          </List>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AvatarModal)
