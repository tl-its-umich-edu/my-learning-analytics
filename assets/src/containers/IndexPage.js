import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import SelectCard from '../components/SelectCard'
import { Link } from 'react-router-dom'
import routes from '../routes/routes'

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

function IndexPage (props) {
  const { classes, courseInfo, courseId } = props

  return (
    <Grid container spacing={16} className={classes.root}>
      <Grid item xs={12} className={classes.container}>
        <Grid
          container
          className={classes.wrapper}
          spacing={8}
        >
          {routes(courseId, courseInfo.course_view_options).map((props, key) =>
            <Link style={{ textDecoration: 'none' }} to={props.path} key={key}>
              <SelectCard cardData={props} />
            </Link>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(IndexPage)
