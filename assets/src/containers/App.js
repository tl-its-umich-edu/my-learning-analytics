import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import FilesAccessed from './FilesAccessed'
import IndexPage from './IndexPage'
import Spinner from '../components/Spinner'
import Error from './Error'
import { useCourseInfo } from '../service/api'

function App(props) {
  const { match } = props
  const courseId = match.params.courseId
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [validCourse, setValidCourse] = useState(false)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const user = {
    firstName: 'Justin',
    lastName: 'Lee',
    email: 'something@something.ca'
  }

  if (error) return (<Error>Something went wrong, please try again later.</Error>)

  return (
    <Router basename='/test/courses/'>
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
              render={props => <GradeDistribution {...props} viewIsActive={!!courseInfo.course_view_options.gd}
                courseId={courseId} />} />
            <Route path='/:courseId/assignment'
              render={props => <AssignmentPlanning {...props} courseInfo={courseInfo}
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
