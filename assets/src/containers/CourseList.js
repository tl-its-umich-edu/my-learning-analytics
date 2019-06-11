import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import Error from './Error'
import { Link } from 'react-router-dom'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  container: {
    display: 'flex',
    justifyContent: 'center'
  },
  wrapper: {
    maxWidth: 1023,
    margin: theme.spacing.unit * 2 + 'px auto',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
})

function CourseList (props) {
  const { classes } = props

  if (myla_globals.is_superuser) {
    return (<Error>You are logged in as '{myla_globals.username}'. Please enter the ID of the course in the URL after '/courses/'.</Error>)
  }

  const userCourseInfo = JSON.parse(myla_globals.user_courses_info)
  if (!userCourseInfo) return (<Error>You are not enrolled in any courses with MyLA enabled.</Error>)

  return (
    <Grid container spacing={16} className={classes.root}>
      <Grid item xs={12} className={classes.container}>
        {userCourseInfo.map((course, key) =>
          <Link style={{ textDecoration: 'none' }} to={course.course_id} key={key}>
            <SelectCard cardData={{ title: course.course_name }} />
          </Link>
        )}
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(CourseList)
