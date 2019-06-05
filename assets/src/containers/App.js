import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Avatar from '@material-ui/core/Avatar'
import Popover from '@material-ui/core/Popover'
import { withStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  button: {
    margin: 1,
  },
  grow: {
    flexGrow: 1
  },
  link: {
    margin: 1,
  }
})
const loginLogic = (loginURL,classes) => {
  return (
    <Button href={loginURL} variant="contained" color="primary" className={classes.button} type="submit">
      Login
    </Button>
  )
}

const logoutAdminLogic = (classes,logOutURL,user,admin)=>{
  return (
    <Grid container spacing={8}>
      <Grid item xs={3}>
        <Paper>
          <Link href={logOutURL} className={classes.link}>Help</Link>
          <Link href={logOutURL} className={classes.link}>Logout</Link>
          <Typography>{user}</Typography>
          {admin?<Link href="/admin" className={classes.link}>Admin</Link>:''}
        </Paper>
      </Grid>
    </Grid>
  )
}

const needToaddlater = ()=>{
  const user = {
    username: myla_globals.username,
    admin: myla_globals.is_superuser
  }
  <Router basename='/courses/'>
    <div>
      <DashboardAppBar onMenuBarClick={setSideDrawerState} sideDrawerState={sideDrawerState} user={user} />
      <SideDrawer toggleDrawer={setSideDrawerState} sideDrawerState={sideDrawerState} />
      <Route path='/:courseId' exact component={IndexPage} />
      <Route path='/:courseId/grades' component={GradeDistribution} />
      <Route path='/:courseId/assignment' component={AssignmentPlanning} />
      <Route path='/:courseId/files' component={FilesAccessed} />
    </div>
  </Router>
}

function App (props) {
  const { match, classes } = props
  const [auth, setAuth] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const logInURL = myla_globals.login
  const user = myla_globals.username
  const admin = myla_globals.is_superuser
  console.log(logInURL)
  const logOutURL = myla_globals.logout
  console.log(logOutURL)
  console.log(`what is in the props: ${match}`)
  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            My Learning Analytics
          </Typography>
          <div className={classes.grow}/>
          {!user ?
            loginLogic(logInURL, classes) :
            logoutAdminLogic(classes,logOutURL,user,admin)}

        </Toolbar>
      </AppBar>
    </div>

  )

}

export default withStyles(styles)(App)
