import React, { useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanning from './AssignmentPlanning'
import FilesAccessed from './FilesAccessed'
import IndexPage from './IndexPage'

function App () {
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const user = {
    username: myla_globals.username
  }

  return (
    <Router basename='/courses/'>
      <div>
        <DashboardAppBar onMenuBarClick={setSideDrawerState} sideDrawerState={sideDrawerState} user={user} />
        <SideDrawer toggleDrawer={setSideDrawerState} sideDrawerState={sideDrawerState} />
        <Route path='/:courseId' exact component={IndexPage} />
        <Route path='/:courseId/grades' component={GradeDistribution} />
        <Route path='/:courseId/assignment' component={AssignmentPlanning} />
        <Route path='/:courseId/files' component={FilesAccessed} />
      </div>
    </Router>
  )
}

export default App
