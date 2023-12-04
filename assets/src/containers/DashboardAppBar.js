import React, { useState } from 'react'
import withStyles from '@mui/styles/withStyles'
import { withRouter, Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Avatar from '@mui/material/Avatar'
import Popover from '@mui/material/Popover'
import AvatarModal from '../components/AvatarModal'
import SurveyModal from '../components/SurveyModal'
import { surveyLink } from '../globals'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  button: {
    margin: theme.spacing(1)
  },
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  homeButton: {
    textDecoration: 'none',
    color: 'white',
    textTransform: 'capitalize',
    padding: 4,
    fontSize: '1.25rem'
  },
  roundButton: {
    borderRadius: '50%',
    padding: '12px',
    color: 'white'
  }
})

function DashboardAppBar (props) {
  const {
    classes,
    onMenuBarClick,
    user,
    courseId,
    courseName
  } = props

  const [avatarEl, setAvatarEl] = useState(null)
  const avatarOpen = Boolean(avatarEl)

  const showSurveyLink = Boolean(surveyLink.text.length && surveyLink.url.length)

  return (
    <div>
      <AppBar className={classes.root} position='fixed'>
        <Toolbar>
          <IconButton
            onClick={onMenuBarClick(true)}
            className={classes.menuButton}
            color='inherit'
            aria-label='Menu'
            size='large'
          >
            <MenuIcon />
          </IconButton>
          <Link to='/courses/' className={classes.homeButton}>
            My Learning Analytics:
          </Link>
          <Link to={`/courses/${courseId}`} className={classes.homeButton}>
            {courseName}
          </Link>
          <div className={classes.grow} />
          {showSurveyLink && <SurveyModal surveyLink={surveyLink} user={user} courseID={courseId} />}
          <IconButton
            aria-owns={avatarOpen ? 'simple-popper' : undefined}
            onClick={event => setAvatarEl(event.currentTarget)}
            color='inherit'
            aria-haspopup='true'
            variant='contained'
            size='large'
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
      <Toolbar />
    </div>
  )
}

export default withRouter(withStyles(styles)(DashboardAppBar))
