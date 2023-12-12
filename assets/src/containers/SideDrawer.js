import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Link } from 'react-router-dom'
import { siteTheme } from '../globals'
import routes from '../routes/routes'
import Spinner from '../components/Spinner'
import { isTeacherOrAdmin } from '../util/roles'
import withRouter from './WithRouter'

const PREFIX = 'SideDrawer'

const classes = {
  list: `${PREFIX}-list`,
  fullList: `${PREFIX}-fullList`,
  sideDrawerLinks: `${PREFIX}-sideDrawerLinks`,
  text: `${PREFIX}-text`
}

const Root = styled('div')({
  [`&.${classes.list}`]: {
    width: 250
  },
  [`& .${classes.fullList}`]: {
    width: 'auto'
  },
  [`& .${classes.sideDrawerLinks}`]: {
    textDecoration: 'none'
  },
  [`& .${classes.text}`]: {
    color: 'black'
  }
})

function SideDrawer (props) {
  const {
    toggleDrawer,
    courseId,
    courseInfo,
    enrollmentTypes,
    isAdmin
  } = props

  const [selectedIndex, setSelectedIndex] = useState(false)

  const sideList = (
    <Root
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
    </Root>
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

export default withRouter(SideDrawer)
