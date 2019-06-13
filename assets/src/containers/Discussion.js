import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import Table from '../components/Table'
import Error from './Error'
import { isObjectEmpty } from '../util/object'

const mockData = [{

}]

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

function Discussion (props) {
  const { classes, disabled, courseId } = props
  if (disabled) return (<Error>Discussion view is hidden for this course.</Error>)

  const [loaded, error, discussionData] = [true, false, mockData]
  if (error) return (<Error>Something went wrong, please try again later.</Error>)
  if (loaded && isObjectEmpty(discussionData)) return (<Error>No data provided.</Error>)

  const buildDiscussionView = discussionData => {
    return (
      <Grid container>
        <Grid item xs={12} lg={2}>
          {/* <Table className={classes.table}>

          </Table> */}
        </Grid>
      </Grid>
    )
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>Discussion</Typography>
            {
              loaded
                ? buildDiscussionView(discussionData)
                : <Spinner />
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(Discussion)
