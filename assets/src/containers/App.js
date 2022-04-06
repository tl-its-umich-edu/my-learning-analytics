import React from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import { matchPath } from 'react-router'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'
import WarningBanner from '../components/WarningBanner'
import { Helmet } from 'react-helmet'

function App (props) {
  const location = useLocation()
  const { user, gaId } = props

  if (!user.isLoggedIn) {
    if (user.loginURL === '') {
      return (<WarningBanner>This tool needs to be launched from a Canvas course.</WarningBanner>)
    }
    return (window.location.href = user.loginURL)
  }
  const coursePageMatch = matchPath(location.pathname, '/courses/:courseId/')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null

  return (
    <>
      <Helmet titleTemplate='%s | My Learning Analytics' title='Courses' />
      <GoogleAnalyticsTracking gaId={gaId} />
      <Switch>
        <Route path='/' exact>
          <CourseList user={user} />
        </Route>
        <Route path='/courses' exact>
          <CourseList user={user} />
        </Route>
        <Route>
          {courseId ? <Course user={user} courseId={Number(courseId)} {...props} /> : null}
        </Route>
      </Switch>
    </>
  )
}

export default App
