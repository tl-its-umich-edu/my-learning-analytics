import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import SelectCard from '../components/SelectCard'
import Error from './Error'
import { Link } from 'react-router-dom'
import { useCourseInfo } from '../service/api'
import { Typography } from '@material-ui/core';

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
  // currently JSON.parse is required because Django is returning string instead of object
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
