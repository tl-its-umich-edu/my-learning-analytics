import React, { useState } from 'react'
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom' // eslint-disable-line
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import AssignmentPlanningV2 from './AssignmentPlanningV2'
import ResourcesAccessed from './ResourcesAccessed'
import IndexPage from './IndexPage'
import Spinner from '../components/Spinner'
import { isObjectEmpty } from '../util/object'
import { useCourseInfo } from '../service/api'
import WarningBanner from '../components/WarningBanner'

function Course (props) {
  const { courseId, user } = props
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setSideDrawerState(open)
  }
  if (error.message === 'Not Found') return (<WarningBanner>Course {courseId} does not exist.</WarningBanner>)
  else if (error.message === 'Forbidden') return (<WarningBanner>You do not have access to course {courseId}.</WarningBanner>)
  else if (error) return (<WarningBanner />)
  if (loaded && isObjectEmpty(courseInfo)) return (<WarningBanner>My Learning Analytics is not enabled for this course.</WarningBanner>)
  
  // not data has been retrieved yet for the course. Wait for next cron job
  if (loaded && (courseInfo.course_user_exist === 0)) return (<WarningBanner>No data is available for {courseInfo.name} yet. Please wait for next system data load.  </WarningBanner>)

  return (
    <>
      {loaded
        ? (
          <>
            <DashboardAppBar
              onMenuBarClick={toggleDrawer}
              sideDrawerState={sideDrawerState}
              user={user}
              courseName={courseInfo.name}
              courseId={courseId}
            />
            <SideDrawer
              toggleDrawer={toggleDrawer}
              sideDrawerState={sideDrawerState}
              courseId={courseId}
              courseInfo={courseInfo}
            />
            <Route
              path='/courses/:courseId/'
              exact
              render={props =>
                <IndexPage
                  {...props}
                  courseInfo={courseInfo}
                  courseId={courseId}
                />}
            />
            <Route
              path='/courses/:courseId/grades'
              render={props =>
                <GradeDistribution
                  {...props}
                  disabled={!courseInfo.course_view_options.gd}
                  courseId={courseId}
                  user={user}
                />}
            />
            <Route
              path='/courses/:courseId/assignmentsv1'
              render={props =>
                <AssignmentPlanning
                  {...props}
                  disabled={!courseInfo.course_view_options.apv1}
                  courseId={courseId}
                />}
            />
            <Route
              path='/courses/:courseId/assignments'
              render={props =>
                <AssignmentPlanningV2
                  {...props}
                  disabled={!courseInfo.course_view_options.ap}
                  courseId={courseId}
                />}
            />
            <Route
              path='/courses/:courseId/resources'
              render={props =>
                <ResourcesAccessed
                  {...props}
                  disabled={!courseInfo.course_view_options.ra}
                  courseInfo={courseInfo}
                  courseId={courseId}
                />}
            />
          </>
        ) : <Spinner />}
    </>
  )
}

export default Course
