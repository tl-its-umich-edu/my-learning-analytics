import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import Error from './Error'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Avatar from '@material-ui/core/Avatar'
import Popover from '@material-ui/core/Popover'
import AvatarModal from '../components/AvatarModal'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  container: {
    display: 'flex',
    justifyContent: 'center'
  },
  wrapper: {
    maxWidth: 1023,
    margin: theme.spacing.unit * 2 + 'px auto',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  grow: {
    flexGrow: 1
  }
})

function CourseList (props) {
  const { classes } = props
  if (!myla_globals.username) return (window.location.href = myla_globals.login)
  if (myla_globals.is_superuser) return (<Paper className={classes.paper}><Typography>Select a course you choose to look in</Typography></Paper>)

  const userCourseInfo = (myla_globals.user_courses_info.length !== 0)
    ? JSON.parse(myla_globals.user_courses_info)
    : ''

  if (!userCourseInfo) return (<Error>You are not enrolled in any courses with MyLA enabled.</Error>)

  const user = {
    username: myla_globals.username,
    admin: myla_globals.is_superuser
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
      <Grid container spacing={16} className={classes.root}>
        <Grid item xs={12} className={classes.container}>
          {userCourseInfo.map((course, key) =>
            <Link style={{ textDecoration: 'none' }} to={course.course_id} key={key}>
              <SelectCard cardData={{ title: course.course_name }} />
            </Link>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default withStyles(styles)(CourseList)
