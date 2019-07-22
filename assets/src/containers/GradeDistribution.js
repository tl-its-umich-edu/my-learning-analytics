import React, { useState } from 'react'
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
import { useGradeData, useSaveSetting } from '../service/api'
import { isObjectEmpty } from '../util/object'

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

  const [loaded, error, gradeData] = useGradeData(courseId)
  if (error) return (<Error>Something went wrong, please try again later.</Error>)
  if (loaded && isObjectEmpty(gradeData)) return (<Error>No data provided.</Error>)

  const [showMyGrade, setShowMyGrade] = useState(false)

  const [saved, saveError] = useSaveSetting(courseId, { grades: showMyGrade })

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
          {'Show my grade'} <Checkbox
            checked={showMyGrade}
            onChange={() => setShowMyGrade(!showMyGrade)} />
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
              loaded
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
