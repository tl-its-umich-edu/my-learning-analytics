import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import MuiLink from '@material-ui/core/Link'
import Popover from '@material-ui/core/Popover'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { siteTheme } from '../globals'
import AlertBanner from '../components/AlertBanner'
import AvatarModal from '../components/AvatarModal'
import SelectCard from '../components/SelectCard'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    padding: 8
  },
  container: {
    display: 'flex',
    justifyContent: 'center'
  },
  grow: {
    flexGrow: 1
  }
})

function CourseList (props) {
  const { classes, user } = props

  const [avatarEl, setAvatarEl] = useState(null)
  const avatarOpen = Boolean(avatarEl)

  const enrolledCourses = JSON.parse(user.enrolledCourses)

  return (
    <>
      <AppBar className={classes.root} position='static'>
        <Toolbar>
          <Typography variant='h6' color='inherit' className={classes.grow}>
            My Learning Analytics
          </Typography>
          <div className={classes.grow} />
          <IconButton
            aria-owns={avatarOpen ? 'simple-popper' : undefined}
            onClick={event => setAvatarEl(event.currentTarget)}
            color='inherit'
            aria-haspopup='true'
            variant='contained'
          >
            <Avatar>{user.username.slice(0, 1)}</Avatar>
          </IconButton>
          <Popover
            open={avatarOpen}
            anchorEl={avatarEl}
            onClose={() => setAvatarEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <AvatarModal user={user} />
          </Popover>
        </Toolbar>
      </AppBar>
      <div className={classes.content}>
        {
          !enrolledCourses.length
            ? (
              <AlertBanner>
                You are not enrolled in any courses with My Learning Analytics enabled.
                Visit the <MuiLink href={user.helpURL} style={{ color: siteTheme.palette.link.main }}>Help site</MuiLink> for
                more information about this tool.
              </AlertBanner>
            )
            : (
              <Grid container spacing={2}>
                <Grid item xs={12} />
                {
                  enrolledCourses.map((course, key) => (
                    <Grid item xs={12} sm={6} lg={4} key={key}>
                      <SelectCard cardData={{ title: course.course_name, description: course.description, path: `/courses/${course.course_id}`, enrollment_type: JSON.parse(user.enrolledCourses).filter(c => c.course_id === course.course_id)[0].enrollment_type, isAdmin: props.user.admin }} />
                    </Grid>
                  ))
                }
              </Grid>
            )
        }
      </div>
    </>
  )
}

export default withStyles(styles)(CourseList)
