import React from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import { matchPath } from 'react-router'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'

function App (props) {
  const { location, user, gaId } = props

  if (!user.isLoggedIn) {
    return (window.location.href = user.loginURL)
  }
  // This is needed to support both the standalone and LTI tool
  const ltiCourseId = user.relatedCourses.length !== 0 ? `/courses/${user.relatedCourses[0].course_id}` : ''
  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null

  return (
    <>
      <GoogleAnalyticsTracking gaId={gaId} />
      <Route path='/' exact render={props => <CourseList {...props} user={user} />} />
      <Route path='/courses' exact render={props => <CourseList {...props} user={user} />} />
      <Route exact path='/lti/launch'><Redirect to={ltiCourseId} /></Route>
      {courseId ? <Course user={user} courseId={parseInt(courseId)} {...props} /> : null}
    </>
  )
}

export default withRouter(App)
