import React from 'react'
import { Route, withRouter } from 'react-router-dom'
import { matchPath } from 'react-router'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'

function App (props) {
  const { location, user, gaId } = props

  if (!user.isLoggedIn) {
    return (window.location.href = user.loginURL)
  }

  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null

  return (
    <>
      <GoogleAnalyticsTracking gaId={gaId} />
      <Route path='/' exact render={props => <CourseList {...props} user={user} />} />
      <Route path='/courses' exact render={props => <CourseList {...props} user={user} />} />
      {courseId ? <Course user={user} courseId={courseId} {...props} /> : null}
    </>
  )
}

export default withRouter(App)
