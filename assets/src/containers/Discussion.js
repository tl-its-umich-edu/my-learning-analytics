import React, { useState, useEffect } from 'react'
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
  ],
  discussion: {
    'conceptual knowledge': [
      'I have conceptual knowledge about this and that',
      'we continue to problematize the entangling of type and qualityin the use of conceptual knowledge and procedural knowledge.',
      'the most prevalent of these frameworks is one comprised of two major kinds of knowledge, conceptual knowledge and procedural knowledge',
      'For example, Star (2005, 2007)identified two kinds of knowledge, “deep procedural knowledge” and “superficial conceptual knowledge”'
    ],
    'database': [
      'A database is an organized collection of data, generally stored and accessed electronically from a computer system.',
      'The database management system (DBMS) is the software that interacts with end users'
    ]
  }
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
  ],
  discussion: {}
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

  const discussionGrid = discussionData => {
    return (
      <Grid container spacing={16}>
        {
          discussionData.keywords.map((keyword, i) => (
            <Grid item xs={3} key={i}>
              <SimpleCard keyword={keyword}>
                {discussionData.discussion[keyword]
                  ? discussionData.discussion[keyword]
                    .map((sentence, i) => <Typography variant='h6' key={i}>(sentence}</Typography>)
                  : null
                }
              </SimpleCard>
            </Grid>
          ))
        }
      </Grid>
    )
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={40}>
          <Grid item xs={12} lg={6}>
            <Typography variant='h5' gutterBottom>My Discussion</Typography>
            {
              myDataLoaded
                ? discussionGrid(myDiscussionData)
                : <Spinner />
            }
          </Grid>
          <Grid item xs={12} lg={6}>
            <Typography variant='h5' gutterBottom>Class Discussion</Typography>
            {
              classDataLoaded
                ? discussionGrid(classDiscussionData)
                : <Spinner />
            }
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}

export default withStyles(styles)(Discussion)
