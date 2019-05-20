import React, { useEffect, useRef, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Histogram from '../components/Histogram'
import Spinner from '../components/Spinner'
import Table from '../components/Table'
import { average, roundToOneDecimcal } from '../util/math'

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

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
}

function GradeDistribution (props) {
  const { classes, courseInfo, courseId } = props
  const [activeGradesView, setActiveGradesView] = useState(false)
  const [gradeData, setGradeData] = useState('')

  useEffect(() => {
    if (courseInfo) {
      const gd = courseInfo.course_view_options.gd
      const viewEnabled = gd === 1 ? true : false
      if(viewEnabled) {
        const fetchOptions = { method: 'get', ...defaultFetchOptions }
        const dataURL = `http://localhost:5001/api/v1/courses/${courseId}/grade_distribution`
        fetch(dataURL, fetchOptions)
          .then(res => res.json())
          .then(data => {
            setGradeData(data)
            setActiveGradesView(viewEnabled)
          })
        return
      }
      //this will save us from getting lost with spinner when view is disabled and no data is fetched
      setGradeData({})
    }
  }, [courseInfo])

  const buildGradeView = gradeData => {

    if(!activeGradesView){
      return (<p>Grade Distribution view is hidden for this course.</p>)
    }

    if (!gradeData || Object.keys(gradeData).length === 0) {
      return (<p>No data provided</p>)
    }
    return (
      <Grid container>
        <Grid item xs={12} lg={2}>
          <Table className={classes.table} tableData={[
            ['My Grade', <strong>{gradeData[0].current_user_grade
              ? `${roundToOneDecimcal(gradeData[0].current_user_grade)}%`
              : 'There are no grades yet for you in this course'}</strong>
            ],
            ['Average Grade', <strong>{average(gradeData.map(x => x.current_grade))}%</strong>],
            ['Number of Students', <strong>{gradeData.length}</strong>]
          ]}/>
        </Grid>
        <Grid item xs={12} lg={10}>
          <Histogram
            data={gradeData.map(x => x.current_grade)}
            aspectRatio={0.3}
            xAxisLabel={'Grade %'}
            yAxisLabel={'Number of Students'}
            myGrade={gradeData[0].current_user_grade}
            maxGrade={gradeData[0].graph_upper_limit}/>
        </Grid>
      </Grid>
    )
  }

  return (

    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>Grade Distribution</Typography>
            {
              gradeData
                ? buildGradeView(gradeData)
                : <Spinner/>
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(GradeDistribution)
