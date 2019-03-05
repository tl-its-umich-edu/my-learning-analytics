import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { Link, withRouter } from 'react-router-dom'
import routes from '../routes/routes'

const styles = {
  list: {
    width: 250
  },
  fullList: {
    width: 'auto'
  },
  sideDrawerLinks: {
    textDecoration: 'none'
  }
}

function SideDrawer (props) {
  const {
    classes,
    toggleDrawer,
    sideDrawerState,
    location
  } = props

  const courseId = location.pathname.split('/')[1]
  const [selectedIndex, setSelectedIndex] = useState(false)

  const sideList = (
    <div className={classes.list}>
      <List>
        {routes(courseId).map((props, key) => (
          <Link to={props.path} className={classes.sideDrawerLinks} key={key}>
            <ListItem
              button
              key={props.sidebarName}
              selected={selectedIndex === key}
              onClick={() => setSelectedIndex(key)}>
              <ListItemIcon><props.icon /></ListItemIcon>
              <ListItemText primary={props.sidebarName} />
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
          onKeyDown={() => toggleDrawer(!sideDrawerState)}
        >
          {sideList}
        </div>
      </Drawer>
    </div>
  )
}

export default withRouter(withStyles(styles)(SideDrawer))
