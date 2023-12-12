import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Avatar from '@mui/material/Avatar'
import Popover from '@mui/material/Popover'
import AvatarModal from '../components/AvatarModal'
import SurveyModal from '../components/SurveyModal'
import { surveyLink } from '../globals'
import withRouter from './WithRouter'

const PREFIX = 'DashboardAppBar'

const classes = {
  root: `${PREFIX}-root`,
  button: `${PREFIX}-button`,
  grow: `${PREFIX}-grow`,
  menuButton: `${PREFIX}-menuButton`,
  homeButton: `${PREFIX}-homeButton`,
  roundButton: `${PREFIX}-roundButton`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1
  },

  [`& .${classes.button}`]: {
    margin: theme.spacing(1)
  },

  [`& .${classes.grow}`]: {
    flexGrow: 1
  },

  [`& .${classes.menuButton}`]: {
    marginLeft: -12,
    marginRight: 20
  },

  [`& .${classes.homeButton}`]: {
    textDecoration: 'none',
    color: 'white',
    textTransform: 'capitalize',
    padding: 4,
    fontSize: '1.25rem'
  },

  [`& .${classes.roundButton}`]: {
    borderRadius: '50%',
    padding: '12px',
    color: 'white'
  }
}))

function DashboardAppBar (props) {
  const {
    onMenuBarClick,
    user,
    courseId,
    courseName
  } = props

  const [avatarEl, setAvatarEl] = useState(null)
  const avatarOpen = Boolean(avatarEl)

  const showSurveyLink = Boolean(surveyLink.text.length && surveyLink.url.length)

  return (
    <Root>
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
    </Root>
  )
}

export default withRouter(DashboardAppBar)
