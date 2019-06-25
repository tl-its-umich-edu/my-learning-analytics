import React, { useState } from 'react'
import { Route, withRouter } from 'react-router-dom'
import { matchPath } from 'react-router';
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'

function App (props) {
  const {
    location
  } = props
  const isLoggedIn = !!myla_globals.username
  // replace with redirect to react login page later
  if (!isLoggedIn) {
    return (window.location.href = myla_globals.login)
  }

  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null
  const user = {
    username: myla_globals.username,
    admin: myla_globals.is_superuser
  }
  return (
    <>
      <GoogleAnalyticsTracking gaId={myla_globals.google_analytics_id} />
      <Route path='/' exact render={props => <CourseList {...props} user={user} />} />
      <Route path='/courses' exact render={props => <CourseList {...props} user={user} />} />
      { courseId ? <Course user={user} courseId={courseId} {...props} /> : null }
    </>
  )
}

export default withRouter(App)
