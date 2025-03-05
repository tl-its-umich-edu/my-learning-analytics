import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'
import CourseList from './CourseList'
import Course from './Course'
import WarningBanner from '../components/WarningBanner'
import AlertBanner from '../components/AlertBanner'
import { Helmet } from 'react-helmet'
import {useGoogleAnalytics, useUmConsent} from '@tl-its-umich-edu/react-ga-onetrust-consent'

function App (props) {
  const { user, gaId, cspNonce } = props
  const { gaInitialized, gaHandlers } = useGoogleAnalytics({ googleAnalyticsId: gaId, nonce: cspNonce })
  const { umConsentInitialize, umConsentInitialized } = useUmConsent()

  if (
    !umConsentInitialized &&
    gaInitialized &&
    gaHandlers.onConsentApprove &&
    gaHandlers.onConsentReject
  ) {
    const consentParams = {
      developmentMode: false,
      alwaysShow: false,
      onConsentApprove: gaHandlers.onConsentApprove,
      onConsentReject: gaHandlers.onConsentReject,
    };
    umConsentInitialize(consentParams)
  }

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
