import React, { useState } from 'react'
import { BrowserRouter as Router, Route, withRouter } from 'react-router-dom'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import ResourcesAccessed from './ResourcesAccessed'
import IndexPage from './IndexPage'
import Spinner from '../components/Spinner'
import { isObjectEmpty } from '../util/object'
import { useCourseInfo } from '../service/api'
import WarningBanner from "../components/WarningBanner"

function Course (props) {
  const { courseId, user } = props
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  if (error) return (<WarningBanner/>)
  if (loaded && isObjectEmpty(courseInfo)) return (<WarningBanner>My Learning Analytics is not enabled for this course.</WarningBanner>)

  return (
    <>
      {
        loaded
          ? <>
            <DashboardAppBar
              onMenuBarClick={setSideDrawerState}
              sideDrawerState={sideDrawerState}
              user={user}
              courseName={courseInfo.name}
              courseId={courseId} />
            <SideDrawer
              toggleDrawer={setSideDrawerState}
              sideDrawerState={sideDrawerState}
              courseId={courseId}
              courseInfo={courseInfo} />
            <Route path='/courses/:courseId/' exact
              render={props => <IndexPage {...props}
                courseInfo={courseInfo} courseId={courseId} />} />
            <Route path='/courses/:courseId/grades'
              render={props => <GradeDistribution {...props}
                disabled={!courseInfo.course_view_options.gd}
                courseId={courseId}
                user={user} />} />
            <Route path='/courses/:courseId/assignments'
              render={props => <AssignmentPlanning {...props}
                disabled={!courseInfo.course_view_options.ap}
                courseId={courseId} />} />
            <Route path='/courses/:courseId/resources'
              render={props => <ResourcesAccessed {...props} disabled={!courseInfo.course_view_options.ra} courseInfo={courseInfo}
                courseId={courseId} />} />
          </>
          : <Spinner />
      }
    </>
  )
}

export default Course
