import { useState, useRef } from 'react'
import { styled } from '@mui/material/styles'
import { Route, Routes, useLocation } from 'react-router-dom'
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
import { isTeacherOrAdmin } from '../util/roles'
import { CardMedia, Card } from '@mui/material'

const PREFIX = 'Course'

const classes = {
  card: `${PREFIX}-card`,
  notLoadedMedia: `${PREFIX}-notLoadedMedia`
}

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
  const { pathname } = useLocation()
  const [loaded, error, courseInfo] = useCourseInfo(courseId)
  const [sideDrawerState, setSideDrawerState] = useState(false)
  const menuButtonRef = useRef(null)
  const contentRef = useRef(null)
  const drawerNavigationRef = useRef(false)
  const route = pathname.split('/').filter(Boolean).pop()

  const matchingCourses = user.relatedCourses.length > 0 ? user.relatedCourses.filter(c => c.course_id === props.courseId) : undefined
  const enrollmentTypes = matchingCourses && matchingCourses.length === 1 ? matchingCourses[0].enrollment_types : []

  // A view's title is only shown when the user can actually see that view:
  // the view is enabled for the course, or the user is a teacher/admin (who
  // sees disabled views in preview mode). Students must not see the title of a
  // disabled view.
  const routeViewCode = { grades: 'gd', assignments: 'ap', resources: 'ra' }[route]
  const viewVisibleToUser = routeViewCode
    ? Boolean(courseInfo && courseInfo.course_view_options && courseInfo.course_view_options[routeViewCode]) ||
      isTeacherOrAdmin(user.admin, enrollmentTypes)
    : false
  const viewTitle = viewVisibleToUser
    ? {
        grades: 'Grade Distribution',
        assignments: 'Assignment Planning',
        resources: 'Resources Accessed'
      }[route]
    : undefined
  const pageTitle = viewTitle
    ? `${viewTitle} | My Learning Analytics`
    : courseInfo && courseInfo.name
      ? `${courseInfo.name} | My Learning Analytics`
      : 'My Learning Analytics'
  const title = <title>{pageTitle}</title>

  const toggleDrawer = (open, navigation = false) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    // Move focus off the menu button before the Drawer's Modal applies
    // aria-hidden to the app root, avoiding the "aria-hidden on a focused
    // ancestor" warning. Focus is restored after the drawer finishes closing.
    if (open) {
      menuButtonRef.current?.blur()
    }
    drawerNavigationRef.current = !open && navigation
    setSideDrawerState(open)
  }

  // Wait until the Modal has removed aria-hidden before focusing the destination.
  const restoreDrawerFocus = () => {
    if (drawerNavigationRef.current) {
      contentRef.current?.querySelector('.view-header')?.focus()
    } else {
      menuButtonRef.current?.focus()
    }
  }

  if (error.message === '404' || error.message === 'Not Found') {
    return (
      <>
        {title}
        <WarningBanner>
          Course {courseId} has not been set up in MyLA. Contact your instructor, who can enable the visualizations by clicking on MyLA in the course navigation.
        </WarningBanner>
      </>
    )
  } else if (error.message === '403' || error.message === 'Forbidden') {
    return (
      <>
        {title}
        <WarningBanner>
          You do not have access to course {courseId}.
        </WarningBanner>
      </>
    )
  } else if (error) {
    return (
      <>
        {title}
        <WarningBanner />
      </>
    )
  }

  if (loaded && isObjectEmpty(courseInfo)) {
    return (
      <>
        {title}
        <WarningBanner>My Learning Analytics is not enabled for this course.</WarningBanner>
      </>
    )
  }

  const notLoadedAltMessage = 'Mouse running on wheel with text "Course Data Being Processed, Try Back in 24 Hours"'

  return (
    <Root ref={contentRef}>
      {title}
      {loaded
        ? (
          <>
            <DashboardAppBar
              onMenuBarClick={toggleDrawer}
              menuButtonRef={menuButtonRef}
              sideDrawerState={sideDrawerState}
              user={user}
              courseName={courseInfo.name}
              courseId={courseId}
            />
            <SideDrawer
              toggleDrawer={toggleDrawer}
              onRestoreFocus={restoreDrawerFocus}
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
                  <Route
                    path='/'
                    element={<IndexPage
                      courseInfo={courseInfo}
                      courseId={courseId}
                      enrollmentTypes={enrollmentTypes}
                      isAdmin={user.admin}
                             />}
                  />
                  <Route
                    path='grades'
                    element={<GradeDistribution
                      user={user}
                      disabled={!courseInfo.course_view_options.gd}
                      courseId={courseId}
                      enrollmentTypes={enrollmentTypes}
                      isAdmin={user.admin}
                             />}
                  />
                  <Route
                    path='assignments'
                    element={<AssignmentPlanningV2
                      disabled={!courseInfo.course_view_options.ap}
                      courseId={courseId}
                      enrollmentTypes={enrollmentTypes}
                      isAdmin={user.admin}
                             />}
                  />
                  <Route
                    path='resources'
                    element={<ResourcesAccessed
                      disabled={!courseInfo.course_view_options.ra}
                      courseInfo={courseInfo}
                      courseId={courseId}
                      enrollmentTypes={enrollmentTypes}
                      isAdmin={user.admin}
                             />}
                  />
                </Routes>
                )}
          </>
          )
        : <Spinner />}
    </Root>
  )
}

export default (Course)
