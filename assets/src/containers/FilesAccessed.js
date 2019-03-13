import React from 'react'
import useFetch from '../hooks/useFetch'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  }
})

function FilesAccessed (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId
  const [loaded, assignmentData] = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=0`)
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >Files Accessed</Typography >
            {loaded
              ? <> </>
              : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(FilesAccessed)
