import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Histogram from '../components/Histogram'
import Spinner from '../components/Spinner'
import Table from '../components/Table'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import Error from './Error'
import { average, roundToOneDecimal, median } from '../util/math'
import { useGradeData } from '../service/api'
import { isObjectEmpty } from '../util/object'
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'

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
  const { classes, disabled, courseId, user } = props
  if (disabled) return (<Error>Grade Distribution view is hidden for this course.</Error>)

  const [gradeLoaded, gradeError, gradeData] = useGradeData(courseId)
  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'grade')
  const [settingChanged, setSettingChanged] = useState(false)
  const [showGrade, setShowGrade] = useState(false)

  useEffect(() => {
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setShowGrade(false)
      } else {
        setShowGrade(userSetting.default !== 'False')
      }
    }
  }, [userSettingLoaded])

  const [userSettingSaved, _, userSettingResponse] = useSetUserSetting(
    courseId,
    { grade: showGrade },
    settingChanged,
    [showGrade]
  )

  if (gradeError) return (<Error>Something went wrong, please try again later.</Error>)
  if (gradeLoaded && isObjectEmpty(gradeData)) return (<Error>No data provided.</Error>)

  const BuildGradeView = () => {
    const grades = gradeData.map(x => x.current_grade)

    const tableRows = [
      ['Average grade', <strong>{roundToOneDecimal(average(grades))}%</strong>],
      ['Median grade', <strong>{roundToOneDecimal(median(grades))}%</strong>],
      ['Number of students', <strong>{gradeData.length}</strong>],
      showGrade ?
        [
          'My grade',
          <strong>{
            gradeData[0].current_user_grade ?
              `${roundToOneDecimal(gradeData[0].current_user_grade)}%` :
              'There are no grades yet for you in this course'
          }</strong>
        ] : []
    ]

    const gradeCheckbox = !user.admin ?
      <> {userSettingLoaded ?
        <> {'Show my grade'}
          <Checkbox
            color='primary'
            checked={showGrade}
            onChange={() => {
              setSettingChanged(true)
              setShowGrade(!showGrade)
            }}
          />
        </> : <Spinner />}
      </> : null

    return (
      <Grid container>
        <Grid item xs={12} lg={2}>
          <Table className={classes.table} noBorder tableData={tableRows} />
          {gradeCheckbox}
          <UserSettingSnackbar
            saved={userSettingSaved}
            response={userSettingResponse} />
        </Grid>
        <Grid item xs={12} lg={10}>
          <Histogram
            data={grades}
            aspectRatio={0.3}
            xAxisLabel={'Grade %'}
            yAxisLabel={'Number of Students'}
            myGrade={showGrade ? gradeData[0].current_user_grade : null}
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
                ? <BuildGradeView />
                : <Spinner />
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(GradeDistribution)
