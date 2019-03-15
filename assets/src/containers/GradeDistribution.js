import React from 'react'
import { renderToString } from 'react-dom/server'
import useFetch from '../hooks/useFetch'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Histogram from '../components/Histogram'
import Spinner from '../components/Spinner'
import createToolTip from '../util/createToolTip'
import Table from '../components/Table'
import { average } from '../util/math'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  table: {
    width: '300px'
  }
})

function GradeDistribution (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId
  const [loaded, gradeData] = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/grade_distribution`)
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >Grade Distribution</Typography >
            {(loaded && gradeData) 
              ? <>
                <Grid item xs={12} sm={4} lg={2}>
                  <Table className={classes.table} tableData={[
                    ['Number of Students', <strong>{gradeData.length}</strong>],
                    ['Average Grade', <strong>{average(gradeData.map(x => x.current_grade))}%</strong>],
                    ['My Grade', <strong>{gradeData[0].current_user_grade}%</strong>]
                  ]} />
                </Grid>
                <Histogram
                  data={gradeData.map(x => x.current_grade)}
                  tip={createToolTip(d => renderToString(
                    <Paper className={classes.paper}>
                      <Table className={classes.table} tableData={[
                        ['Number of Students', <strong>{d.length}</strong>],
                        ['Average Grade', <strong>{average(d)}%</strong>]
                      ]} />
                    </Paper>
                  ))}
                  aspectRatio={0.3}
                  xAxisLabel={'Grade %'}
                  yAxisLabel={'Number of Students'}
                  myGrade={gradeData[0].current_user_grade} />
              </> : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(GradeDistribution)
