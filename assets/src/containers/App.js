import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import { matchPath } from 'react-router'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'
import { ThemeProvider } from '@material-ui/core/styles'
import siteTheme from '../siteTheme'

const mylaGlobals = JSON.parse(document.getElementById("myla_globals").textContent)

/*
Frozen to prevent unintentional changes to this object. This object is strictly readonly.
mylaGlobals should ONLY be accessed in App.js, and nowhere else.
*/
const user = Object.freeze({
  username: mylaGlobals.username,
  admin: mylaGlobals.is_superuser,
  relatedCourses: mylaGlobals.user_courses_info,
  isSuperuser: mylaGlobals.is_superuser,
  isLoggedIn: !!mylaGlobals.username,
  helpURL: mylaGlobals.help_url
})

function App (props) {
  const { location } = props

  if (!user.isLoggedIn) {
    return (window.location.href = mylaGlobals.login)
  }

  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null

  return (
    <ThemeProvider theme={siteTheme}>
      <GoogleAnalyticsTracking gaId={mylaGlobals.google_analytics_id} />
      <Route path='/' exact render={props => <CourseList {...props} user={user} />} />
      <Route path='/courses' exact render={props => <CourseList {...props} user={user} />} />
      {courseId ? <Course user={user} courseId={courseId} {...props} /> : null}
    </ThemeProvider>
  )
}

export default withRouter(App)
