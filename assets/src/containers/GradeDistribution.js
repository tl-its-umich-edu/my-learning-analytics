import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Histogram from '../components/Histogram'
import Spinner from '../components/Spinner'
import Table from '../components/Table'
import Error from './Error'
import { average, roundToOneDecimcal, median } from '../util/math'
import { useGradeData } from '../service/api'
import { isObjectEmpty } from '../util/object'
import Cookie from 'js-cookie'
import { handleError } from '../util/data'

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
  const { classes, disabled, courseId } = props
  if (disabled) return (<Error>Grade Distribution view is hidden for this course.</Error>)

  const [gradeLoaded, gradeError, gradeData] = useGradeData(courseId)
  if (gradeError) return (<Error>Something went wrong, please try again later.</Error>)
  if (gradeLoaded && isObjectEmpty(gradeData)) return (<Error>No data provided.</Error>)

  const [userSettingLoaded, setUserSettingLoaded] = useState(false)
  const [showMyGrade, setShowMyGrade] = useState(false)
  const [settingChanged, setSettingChanged] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/courses/${courseId}/get_user_default_selection?default_type=grades`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': Cookie.get('csrftoken')
      },
      credentials: 'include'
    }).then(handleError)
      .then(res => res.json())
      .then(data => {
        setUserSettingLoaded(true)
        if (data.default === 'False') {
          setShowMyGrade(false)
        } else {
          setShowMyGrade(true)
        }
      })
  }, []) // the empty array passed as second arg to useEffect ensures this effect only runs once

  useEffect(() => {
    if (settingChanged) {
      fetch(`/api/v1/courses/${courseId}/set_user_default_selection`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': Cookie.get('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify({ grades: showMyGrade }),
        method: 'PUT'
      })
    }
  }, [showMyGrade])

  const buildGradeView = gradeData => {
    const grades = gradeData.map(x => x.current_grade)
    return (
      <Grid container>
        <Grid item xs={12} lg={2}>
          <Table className={classes.table} noBorder tableData={[
            [
              'My grade', <strong>{gradeData[0].current_user_grade
                ? `${roundToOneDecimcal(gradeData[0].current_user_grade)}%`
                : 'There are no grades yet for you in this course'}</strong>
            ],
            [
              'Average grade',
              <strong>{roundToOneDecimcal(average(grades))}%</strong>
            ],
            [
              'Median grade',
              <strong>{roundToOneDecimcal(median(grades))}%</strong>
            ],
            ['Number of students', <strong>{gradeData.length}</strong>]
          ]} />
          {userSettingLoaded
            ? <> {'Show my grade'} <Checkbox
              checked={showMyGrade}
              onChange={() => {
                setSettingChanged(true)
                setShowMyGrade(!showMyGrade)
              }} />
            </>
            : <Spinner />}
        </Grid>
        <Grid item xs={12} lg={10}>
          <Histogram
            data={grades}
            aspectRatio={0.3}
            xAxisLabel={'Grade %'}
            yAxisLabel={'Number of Students'}
            myGrade={showMyGrade ? gradeData[0].current_user_grade : null}
            maxGrade={gradeData[0].graph_upper_limit} />
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
              gradeLoaded
                ? buildGradeView(gradeData)
                : <Spinner />
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(GradeDistribution)
