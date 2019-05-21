import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import FilesAccessed from './FilesAccessed'
import IndexPage from './IndexPage'
import { useCourseInfo } from '../service/api'

function App (props) {
  const { match } = props
  const courseId = match.params.courseId
  const [loaded, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const user = {
    firstName: 'Justin',
    lastName: 'Lee',
    email: 'something@something.ca'
  }

  return (
    <Router basename='/test/courses/'>
      <>
        <DashboardAppBar
          onMenuBarClick={setSideDrawerState}
          sideDrawerState={sideDrawerState}
          user={user}
          courseName={loaded ? courseInfo.name : null}
          courseId={courseId} />
        <SideDrawer
          toggleDrawer={setSideDrawerState}
          sideDrawerState={sideDrawerState}
          courseId={courseId}
          courseInfo={loaded ? courseInfo : null} />
        <Route path='/:courseId/' exact
          render={props => <IndexPage {...props} courseInfo={loaded ? courseInfo : null} courseId={courseId} />} />
        <Route path='/:courseId/grades'
          render={props => <GradeDistribution {...props} viewIsActive={loaded ? courseInfo.course_view_options.gd : null}
            courseId={courseId} />} />
        <Route path='/:courseId/assignment'
          render={props => <AssignmentPlanning {...props} courseInfo={loaded ? courseInfo : null}
            courseId={courseId} />} />
        <Route path='/:courseId/files'
          render={props => <FilesAccessed {...props} courseInfo={loaded ? courseInfo : null}
            courseId={courseId} />} />
      </>
    </Router>
  )
}

export default App
