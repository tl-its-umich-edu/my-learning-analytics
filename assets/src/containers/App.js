import { Route, Routes, useMatch } from 'react-router-dom'
import CourseList from './CourseList'
import Course from './Course'
import WarningBanner from '../components/WarningBanner'
import AlertBanner from '../components/AlertBanner'

function App (props) {
  const { user } = props
  if (!user.isLoggedIn) {
    if (user.loginURL === '') {
      return (
        <>
          <title>My Learning Analytics</title>
          <WarningBanner>This tool needs to be launched from a Canvas course.</WarningBanner>
        </>
      )
    }
    return (window.location.href = user.loginURL)
  }
  const coursePageMatch = useMatch('/courses/:courseId/*')
  const courseId = coursePageMatch ? coursePageMatch.params.courseId : null
  return (
    <>
      {!coursePageMatch && <title>Courses | My Learning Analytics</title>}
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
