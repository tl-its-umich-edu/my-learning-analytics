import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { Link, withRouter } from 'react-router-dom'
import { siteTheme } from '../globals'
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
    courseId,
    courseInfo
  } = props

  const [selectedIndex, setSelectedIndex] = useState(false)

  const sideList = (
    <div
      className={classes.list}
      onClick={toggleDrawer(false)}
      role='button'
    >
      <List>
        {routes(courseId, courseInfo.course_view_options).map((props, key) => (
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
