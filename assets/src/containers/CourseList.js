import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import Popover from '@material-ui/core/Popover'
import AvatarModal from '../components/AvatarModal'
import WarningBanner from '../components/WarningBanner'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: 'flex'
  },
  grow: {
    flexGrow: 1
  }
})

function CourseList (props) {
  const { classes, user } = props

  if (!user.relatedCourses && !user.isSuperuser) {
    return (<WarningBanner>You are not enrolled in any courses with My Learning Analytics enabled.</WarningBanner>)
  }

  const [avatarEl, setAvatarEl] = useState(null)
  const avatarOpen = Boolean(avatarEl)

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
            variant='contained'>
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
      {
        user.isSuperuser
          ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <Typography variant='h5' gutterBottom>Select a course of your choice</Typography>
                </Paper>
              </Grid>
            </Grid>
          )
          : (
            <Grid container spacing={2}>
              {
                user.relatedCourses.map((course, key) => (
                  <Grid item xs={12} sm={6} lg={4} key={key}>
                    <Link style={{ textDecoration: 'none' }} to={`/courses/${course.course_id}`}>
                      <SelectCard cardData={{ title: course.course_name }} />
                    </Link>
                  </Grid>
                ))
              }
            </Grid>
          )
      }
    </>
  )
}

export default withStyles(styles)(CourseList)
