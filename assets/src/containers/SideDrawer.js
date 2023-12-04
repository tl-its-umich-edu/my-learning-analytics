import React, { useState } from 'react'
import withStyles from '@mui/styles/withStyles'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Link, withRouter } from 'react-router-dom'
import { siteTheme } from '../globals'
import routes from '../routes/routes'
import Spinner from '../components/Spinner'
import { isTeacherOrAdmin } from '../util/roles'

const styles = {
  list: {
    width: 250
  },
  fullList: {
    width: 'auto'
  },
  sideDrawerLinks: {
    textDecoration: 'none'
  },
  text: {
    color: 'black'
  }
}

function SideDrawer (props) {
  const {
    classes,
    toggleDrawer,
    courseId,
    courseInfo,
    enrollmentTypes,
    isAdmin
  } = props

  const [selectedIndex, setSelectedIndex] = useState(false)

  const sideList = (
    <div
      className={classes.list}
      onClick={toggleDrawer(false)}
      role='button'
    >
      <List>
        {routes(courseId, courseInfo.course_view_options, !isTeacherOrAdmin(isAdmin, enrollmentTypes)).map((props, key) => (
          <ListItem
            button
            component={Link}
            to={props.path}
            key={key}
            className={classes.sideDrawerLinks}
            onClick={() => setSelectedIndex(key)}
          >
            <ListItemIcon>
              {
                selectedIndex === key
                  ? <props.icon color='secondary' />
                  : <props.icon style={{ color: siteTheme.palette.negative.main }} />
              }
            </ListItemIcon>
            <ListItemText primary={props.title} className={classes.text} />
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <div>
      <Drawer open={props.sideDrawerState} onClose={toggleDrawer(false)}>
        {courseInfo
          ? sideList
          : <Spinner />}
      </Drawer>
    </div>
  )
}

export default withRouter(withStyles(styles)(SideDrawer))
