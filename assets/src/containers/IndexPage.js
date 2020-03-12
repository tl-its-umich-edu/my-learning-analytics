import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import { Link } from 'react-router-dom'
import { isObjectEmpty, getObjectValues } from '../util/object'
import WarningBanner from '../components/WarningBanner'
import routes from '../routes/routes'

const styles = theme => ({
  root: {
    flexGrow: 1
  }
})

const objectValuesAreAllZero = obj => getObjectValues(obj).every(x => x === 0)

function IndexPage (props) {
  const { classes, courseInfo, courseId } = props

  const views = courseInfo.course_view_options

  if (isObjectEmpty(views) || objectValuesAreAllZero(views)) {
    return (<WarningBanner>No data visualizations have been added for this course.</WarningBanner>)
  }

  return (
    <Grid container spacing={2}>
      {
        routes(courseId, views).map((props, key) => (
          <Grid item xs={12} sm={6} lg={4} key={key}>
            <Link tabIndex={-1} style={{ textDecoration: 'none' }} to={props.path}>
              <SelectCard cardData={props} />
            </Link>
          </Grid>
        ))
      }
    </Grid>
  )
}

export default withStyles(styles)(IndexPage)
