import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { withRouter, Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Avatar from '@material-ui/core/Avatar'
import Popover from '@material-ui/core/Popover'
import AvatarModal from '../components/AvatarModal'
import SurveyModal from '../components/SurveyModal'
import { surveyURL } from '../globals'

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

  return (
    <div>
      <AppBar className={classes.root} position='fixed'>
        <Toolbar>
          <IconButton
            onClick={onMenuBarClick(true)}
            className={classes.menuButton}
            color='inherit'
            aria-label='Menu'
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
          {
            surveyURL  
            ? <SurveyModal surveyURL={surveyURL}/>
            : null
          }
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
      <Toolbar />
    </div>
  )
}

export default withRouter(withStyles(styles)(DashboardAppBar))
