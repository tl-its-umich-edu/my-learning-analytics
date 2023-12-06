import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MuiLink from '@mui/material/Link'
import Popover from '@mui/material/Popover'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { siteTheme } from '../globals'
import AlertBanner from '../components/AlertBanner'
import AvatarModal from '../components/AvatarModal'
import CourseListCard from '../components/CourseListCard'

const PREFIX = 'CourseList'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  content: `${PREFIX}-content`,
  container: `${PREFIX}-container`,
  grow: `${PREFIX}-grow`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1
  },

  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: 'flex'
  },

  [`& .${classes.content}`]: {
    flexGrow: 1,
    padding: 8
  },

  [`& .${classes.container}`]: {
    display: 'flex',
    justifyContent: 'center'
  },

  [`& .${classes.grow}`]: {
    flexGrow: 1
  }
}))

function CourseList (props) {
  const { user } = props

  const [avatarEl, setAvatarEl] = useState(null)
  const avatarOpen = Boolean(avatarEl)

  return (
    <Root>
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
            <Avatar>{user.initials}</Avatar>
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
          !user.relatedCourses.length
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
                  user.relatedCourses.map((course, key) => (
                    <Grid item xs={12} sm={6} lg={4} key={key}>
                      <CourseListCard path={`/courses/${course.course_id}`} courseName={course.course_name} />
                    </Grid>
                  ))
                }
              </Grid>
              )
        }
      </div>
    </Root>
  )
}

export default (CourseList)
