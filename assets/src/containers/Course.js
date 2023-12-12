import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Route, Routes } from 'react-router-dom'
import DashboardAppBar from './DashboardAppBar'
import SideDrawer from './SideDrawer'
import GradeDistribution from './GradeDistribution'
import AssignmentPlanningV2 from './AssignmentPlanningV2'
import ResourcesAccessed from './ResourcesAccessed'
import IndexPage from './IndexPage'
import Spinner from '../components/Spinner'
import { isObjectEmpty } from '../util/object'
import { useCourseInfo } from '../service/api'
import WarningBanner from '../components/WarningBanner'
import { CardMedia, Card } from '@mui/material'
import { Helmet } from 'react-helmet'

const PREFIX = 'Course'

const classes = {
  card: `${PREFIX}-card`,
  notLoadedMedia: `${PREFIX}-notLoadedMedia`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.card}`]: {
    margin: theme.spacing(3)
  },

  [`& .${classes.notLoadedMedia}`]: {
    maxWidth: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}))

function Course (props) {
  const { courseId, user } = props
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)

  const matchingCourses = user.relatedCourses.length > 0 ? user.relatedCourses.filter(c => c.course_id === props.courseId) : undefined
  const enrollmentTypes = matchingCourses && matchingCourses.length === 1 ? matchingCourses[0].enrollment_types : []

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setSideDrawerState(open)
  }

  if (error.message === 'Not Found') return (<WarningBanner>Course {courseId} has not been set up in MyLA. Contact your instructor, who can enable the visualizations by clicking on MyLA in the course navigation.</WarningBanner>)
  else if (error.message === 'Forbidden') return (<WarningBanner>You do not have access to course {courseId}.</WarningBanner>)
  else if (error) return (<WarningBanner />)
  if (loaded && isObjectEmpty(courseInfo)) return (<WarningBanner>My Learning Analytics is not enabled for this course.</WarningBanner>)

  const notLoadedAltMessage = 'Mouse running on wheel with text "Course Data Being Processed, Try Back in 24 Hours"'

  return (
    <Root>
      {loaded
        ? (
          <>
            <Helmet titleTemplate='%s | My Learning Analytics' title={courseInfo.name} />
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
              enrollmentTypes={enrollmentTypes}
              isAdmin={user.admin}
            />
            {courseInfo.course_data_loaded === 0
              ? (
                <Card className={classes.card}>
                  <CardMedia
                    className={classes.notLoadedMedia}
                    component='img'
                    image='/static/images/no-course-data-msg.png'
                    title={notLoadedAltMessage}
                    alt={notLoadedAltMessage}
                  />
                </Card>
                )
              : (
                <Routes>
                  <Route path='/'>  
                    <Route index= {true} element={
                      <IndexPage
                        courseInfo={courseInfo}
                        courseId={courseId}
                        enrollmentTypes={enrollmentTypes}
                        isAdmin={user.admin}
                      /> }
                    />
                    <Route path='grades'  element={
                      <GradeDistribution
                        user={user}
                        disabled={!courseInfo.course_view_options.gd}
                        courseId={courseId}
                        enrollmentTypes={enrollmentTypes}
                        isAdmin={user.admin}
                      /> }
                    />
                    <Route path='assignments'  element={
                      <AssignmentPlanningV2
                        disabled={!courseInfo.course_view_options.ap}
                        courseId={courseId}
                        enrollmentTypes={enrollmentTypes}
                        isAdmin={user.admin}
                      /> }
                    />
                    <Route path='resources'  element={
                      <ResourcesAccessed
                        disabled={!courseInfo.course_view_options.ra}
                        courseInfo={courseInfo}
                        courseId={courseId}
                        enrollmentTypes={enrollmentTypes}
                        isAdmin={user.admin}
                      /> }
                    />
                  </Route>
                </Routes>
                 )
            }
          </>
          )
        : <Spinner />}
    </Root>
  )
}

export default (Course)
