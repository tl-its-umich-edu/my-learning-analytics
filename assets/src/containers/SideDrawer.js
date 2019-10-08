import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { Link, withRouter } from 'react-router-dom'
import routes from '../routes/routes'
import Spinner from '../components/Spinner'

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
    sideDrawerState,
    courseId,
    courseInfo
  } = props

  const [selectedIndex, setSelectedIndex] = useState(false)

  const sideList = (
    <div className={classes.list}>
      <List>
        {routes(courseId, courseInfo.course_view_options).map((props, key) => (
          <Link to={props.path} className={classes.sideDrawerLinks} key={key}>
            <ListItem
              button
              key={props.title}
              selected={selectedIndex === key}
              onClick={() => setSelectedIndex(key)}>
              <ListItemIcon><props.icon /></ListItemIcon>
              <ListItemText primary={props.title} className={classes.text}/>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  )

  return (
    <div>
      <Drawer open={props.sideDrawerState} onClose={() => toggleDrawer(!sideDrawerState)}>
        <div
          tabIndex={0}
          role='button'
          onClick={() => toggleDrawer(!sideDrawerState)}
          onKeyDown={() => toggleDrawer(!sideDrawerState)} >
          {courseInfo
            ? sideList
            : <Spinner />}
        </div>
      </Drawer>
    </div>
  )
}

export default withRouter(withStyles(styles)(SideDrawer))
