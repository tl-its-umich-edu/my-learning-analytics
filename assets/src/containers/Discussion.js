import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import SimpleCard from '../components/SimpleCard'
import DiscussionSentenceList from '../components/DiscussionSentenceList'
import Error from './Error'
import { isObjectEmpty } from '../util/object'

const color = [

]

const myMockData = [
  {
    keyword: 'conceptual knowledge',
    coherence: 1,
    usage: [
      'I have conceptual knowledge about this and that',
      'we continue to problematize the entangling of type and qualityin the use of conceptual knowledge and procedural knowledge.',
      'the most prevalent of these frameworks is one comprised of two major kinds of knowledge, conceptual knowledge and procedural knowledge',
      'For example, Star (2005, 2007)identified two kinds of knowledge, “deep procedural knowledge” and “superficial conceptual knowledge”'
    ]
  }, {
    keyword: 'database',
    coherence: 0.7,
    usage: [
      'A database is an organized collection of data, generally stored and accessed electronically from a computer system.',
      'The database management system (DBMS) is the software that interacts with end users'
    ]
  },
  {
    keyword: 'scripting language',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'jobs',
    coherence: 0.1,
    usage: []
  },
  {
    keyword: 'website',
    coherence: 0.6,
    usage: []
  },
  {
    keyword: 'feature',
    coherence: 1.0,
    usage: []
  },
  {
    keyword: 'networking',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'web development',
    coherence: 0.3,
    usage: []
  },
  {
    keyword: 'backend',
    coherence: 0.1,
    usage: []
  },
  {
    keyword: 'programming',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'demand',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'open source',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'popularity',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'trend',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'application area',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'software maintenance',
    coherence: 0.9,
    usage: []
  }
]

const classMockData = [
  {
    keyword: 'conceptual knowledge',
    coherence: 0.3,
    usage: [
      'I have conceptual knowledge about this and that',
      'we continue to problematize the entangling of type and qualityin the use of conceptual knowledge and procedural knowledge.',
      'the most prevalent of these frameworks is one comprised of two major kinds of knowledge, conceptual knowledge and procedural knowledge',
      'For example, Star (2005, 2007)identified two kinds of knowledge, “deep procedural knowledge” and “superficial conceptual knowledge”'
    ]
  }, {
    keyword: 'database',
    coherence: 0.7,
    usage: [
      'A database is an organized collection of data, generally stored and accessed electronically from a computer system.',
      'The database management system (DBMS) is the software that interacts with end users'
    ]
  },
  {
    keyword: 'scripting language',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'jobs',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'website',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'feature',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'networking',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'web development',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'backend',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'programming',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'demand',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'open source',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'popularity',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'trend',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'application area',
    coherence: 0.4,
    usage: []
  },
  {
    keyword: 'software maintenance',
    coherence: 0.4,
    usage: []
  }
]

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
          discussionData.map((word, i) => (
            <Grid item xs={3} key={i}>
              <SimpleCard keyword={word.keyword} coherence={word.coherence} >
                <DiscussionSentenceList usage={word.usage} />
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
