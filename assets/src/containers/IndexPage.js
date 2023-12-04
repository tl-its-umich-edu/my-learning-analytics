import React from 'react'
import Grid from '@mui/material/Grid'
import SelectCard from '../components/SelectCard'
import { isObjectEmpty, getObjectValues } from '../util/object'
import WarningBanner from '../components/WarningBanner'
import routes from '../routes/routes'
import { isTeacherOrAdmin } from '../util/roles'

const objectValuesAreAllZero = obj => getObjectValues(obj).every(x => x === 0)

function IndexPage (props) {
  const { courseInfo, courseId, isAdmin, enrollmentTypes } = props

  const views = courseInfo.course_view_options

  const teacherOrAdmin = isTeacherOrAdmin(isAdmin, enrollmentTypes)

  if (!teacherOrAdmin) {
    if (isObjectEmpty(views) || objectValuesAreAllZero(views)) {
      return (<WarningBanner>No data visualizations have been added for this course.</WarningBanner>)
    }
  }

  return (
    <Grid container>
      {
        routes(courseId, views, !teacherOrAdmin).map((p, key) => (
          <Grid item xs={12} sm={6} lg={4} key={key}>
            <SelectCard {...props} cardData={p} />
          </Grid>
        ))
      }
    </Grid>
  )
}

export default IndexPage
