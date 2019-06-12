import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import Error from './Error'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'

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
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  }
})

function CourseList (props) {
  const { classes } = props
  if (!myla_globals.username) return (window.location.href = myla_globals.login)
  if (myla_globals.is_superuser) return (<Paper className={classes.paper}><Typography>Select a course you choose to look in</Typography></Paper>)
  let userCourseInfo = ''
  if (myla_globals.user_courses_info.length !== 0) {
    userCourseInfo = JSON.parse(myla_globals.user_courses_info)
  }
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
