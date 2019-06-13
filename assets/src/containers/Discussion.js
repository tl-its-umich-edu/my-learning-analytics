import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import SimpleCard from '../components/SimpleCard'
import Error from './Error'
import { isObjectEmpty } from '../util/object'

const myMockData = {
  keywords: [
    'conceptual knowledge',
    'database',
    'scripting language',
    'jobs',
    'website',
    'feature',
    'networking',
    'web development',
    'backend',
    'programming',
    'demand',
    'open source',
    'popularity',
    'trend',
    'application area',
    'software maintenance'
  ]
}

const classMockData = {
  keywords: [
    'conceptual knowledge',
    'database',
    'scripting language',
    'jobs',
    'website',
    'feature',
    'networking',
    'web development',
    'backend',
    'programming',
    'demand',
    'open source',
    'popularity',
    'trend',
    'application area',
    'software maintenance'
  ]
}

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

  const [myDataLoaded, myDataError, myDiscussionData] = [true, false, myMockData]
  const [classDataLoaded, classDataError, classDiscussionData] = [true, false, classMockData]
  if (myDataError || classDataError) return (<Error>Something went wrong, please try again later.</Error>)
  if ((myDataLoaded && isObjectEmpty(myDiscussionData)) ||
    (classDataLoaded && isObjectEmpty(classDiscussionData))
  ) return (<Error>No data provided.</Error>)

  const buildDiscussionView = discussionData => {
    return (
      <Grid container>
        {
          discussionData.keywords.map((keyword) => (
            <Grid item xs={3}>
              <SimpleCard keyword={keyword} />
            </Grid>
          ))
        }
      </Grid>
    )
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>Discussion</Typography>
            <Grid container>
              <Grid item xs={6}>
                <Typography>My Discussion</Typography>
                {
                  myDataLoaded
                    ? buildDiscussionView(myDiscussionData)
                    : <Spinner />
                }
              </Grid>
              <Grid item xs={6}>
                <Typography>Class Discussion</Typography>
                {
                  classDataLoaded
                    ? buildDiscussionView(classDiscussionData)
                    : <Spinner />
                }
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(Discussion)
