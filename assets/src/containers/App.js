/* global myla_globals */
import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import { matchPath } from 'react-router'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'
import { ThemeProvider } from '@material-ui/core/styles'
import theme from "../theme"

const enrolledCourses = (myla_globals.user_courses_info.length !== 0)
  ? JSON.parse(myla_globals.user_courses_info)
  : ''

/*
Frozen to prevent unintentional changes to this object. This object is strictly readonly.
myla_globals should ONLY be accessed in App.js, and nowhere else.
*/
const user = Object.freeze({
  username: myla_globals.username,
  admin: myla_globals.is_superuser,
  enrolledCourses,
  isSuperuser: myla_globals.is_superuser,
  isLoggedIn: !!myla_globals.username,
  helpURL: myla_globals.help_url
})

function App (props) {
  const { location } = props

  if (!user.isLoggedIn) {
    return (window.location.href = myla_globals.login)
  }

  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null

  return (
    <ThemeProvider theme={theme}>
      <GoogleAnalyticsTracking gaId={myla_globals.google_analytics_id} />
      <Route path='/' exact render={props => <CourseList {...props} user={user} />} />
      <Route path='/courses' exact render={props => <CourseList {...props} user={user} />} />
      {courseId ? <Course user={user} courseId={courseId} {...props} /> : null}
    </ThemeProvider>
  )
}

export default withRouter(App)
