import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import CourseList from './CourseList'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import FilesAccessed from './FilesAccessed'
import IndexPage from './IndexPage'
import Spinner from '../components/Spinner'
import Error from './Error'
import { isObjectEmpty } from '../util/object'
import { useCourseInfo } from '../service/api'

function App (props) {
  const { match } = props
  const courseId = match.params.courseId
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const user = {
    username: myla_globals.username,
    admin: myla_globals.is_superuser
  }

  if (!user.username) return (window.location.href = myla_globals.login)
  if (error) return (<Error>Something went wrong, please try again later.</Error>)
  if (loaded && isObjectEmpty(courseInfo)) return (<Error>Tool is not enabled for this course.</Error>)

  return (
    <Router basename='/courses/'>
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
            <Route path='/:courseId/' exact
              render={props => <IndexPage {...props} courseInfo={courseInfo} courseId={courseId} />} />
            <Route path='/:courseId/grades'
              render={props => <GradeDistribution {...props} disabled={!courseInfo.course_view_options.gd}
                courseId={courseId} />} />
            <Route path='/:courseId/assignment'
              render={props => <AssignmentPlanning {...props} disabled={!courseInfo.course_view_options.ap}
                courseId={courseId} />} />
            <Route path='/:courseId/files'
              render={props => <FilesAccessed {...props} courseInfo={courseInfo}
                courseId={courseId} />} />
          </>
          : <Spinner />
      }
    </Router>
  )
}

export default App
