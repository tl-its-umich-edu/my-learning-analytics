import React, { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import LogoutIcon from '@mui/icons-material/ExitToApp'
import HelpIcon from '@mui/icons-material/HelpOutline'
import Lock from '@mui/icons-material/Lock'
import Launch from '@mui/icons-material/Launch'
import { viewHelpURLs } from '../globals'

const PREFIX = 'AvatarModal'

const classes = {
  root: `${PREFIX}-root`,
  typography: `${PREFIX}-typography`,
  avatar: `${PREFIX}-avatar`,
  link: `${PREFIX}-link`,
  text: `${PREFIX}-text`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    flexGrow: 1
  },

  [`& .${classes.typography}`]: {
    marginTop: theme.spacing(2)
  },

  [`& .${classes.avatar}`]: {
    padding: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },

  [`& .${classes.link}`]: {
    textDecoration: 'none',
    marginLeft: 0
  },

  [`& .${classes.text}`]: {
    paddingLeft: 0,
    color: 'black'
  }
}))

function AvatarModal (props) {
  const { user } = props

  const url = window.location.href

  const [helpURL, setHelpURL] = useState(user.helpURL)
  const [openChangeCourseDialog, setOpenChangeCourseDialog] = useState(false)

  const Admin = () => (
    <>
      <Link style={{ textDecoration: 'none' }} href='/admin'>
        <ListItemButton>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText inset primary='Admin' className={classes.text} />
        </ListItemButton>
      </Link>
      <Divider />
    </>
  )

  const SwitchCourses = () => (
    <>
      <ListItemButton onClick={() => setOpenChangeCourseDialog(true)}>
        <ListItemIcon>
          <Launch />
        </ListItemIcon>
        <ListItemText inset primary='Switch courses' className={classes.text} />
      </ListItemButton>
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
              <ListItemButton>
                <ListItemText inset primary={course.course_name} className={classes.text} />
              </ListItemButton>
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
    <Root className={classes.root}>
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
            <Link style={{ textDecoration: 'none' }} href={helpURL} target='_blank' rel='noopener noreferrer'>
              <ListItemButton>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText inset primary='Help' className={classes.text} />
              </ListItemButton>
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
                    <ListItemButton>
                      <ListItemIcon>
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText inset primary='Logout' className={classes.text} />
                    </ListItemButton>
                  </Link>
                  )
                : null
            }
          </List>
        </Grid>
      </Grid>
    </Root>
  )
}

export default (AvatarModal)
