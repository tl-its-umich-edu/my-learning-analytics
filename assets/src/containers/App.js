import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import GoogleAnalyticsTracking from '../components/GoogleAnalyticsTracking'
import CourseList from './CourseList'
import Course from './Course'
import WarningBanner from '../components/WarningBanner'
import AlertBanner from '../components/AlertBanner'
import { Helmet } from 'react-helmet'

function App (props) {
  const { user, gaId, cspNonce } = props

  if (!user.isLoggedIn) {
    if (user.loginURL === '') {
      return (<WarningBanner>This tool needs to be launched from a Canvas course.</WarningBanner>)
    }
    return (window.location.href = user.loginURL)
  }
  const coursePageMatch = useMatch('/courses/:courseId/*')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null
  return (
    <>
      <Helmet titleTemplate='%s | My Learning Analytics' title='Courses' />
      <GoogleAnalyticsTracking {...{ gaId, cspNonce }} />
      <Routes>
        <Route path='/' element={<CourseList user={user} />} />
        <Route path='/courses' element={<CourseList user={user} />} />
        <Route
          path='/courses/:courseId/*'
          element={courseId ? <Course user={user} courseId={Number(courseId)} {...props} /> : <AlertBanner>Application Launch did not happened properely</AlertBanner>}
        />
      </Routes>
    </>
  )
}

export default App
