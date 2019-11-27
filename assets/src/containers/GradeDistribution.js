import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import AlertBanner from '../components/AlertBanner'
import WarningBanner from '../components/WarningBanner'
import Histogram from '../components/Histogram'
import Spinner from '../components/Spinner'
import Table from '../components/Table'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import { roundToOneDecimal } from '../util/math'
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
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  table: {
    width: '300px'
  }
})

function GradeDistribution (props) {
  const { classes, disabled, courseId, user } = props
  if (disabled) return (<AlertBanner>The Grade Distribution view is hidden for this course.</AlertBanner>)

  const [gradeLoaded, gradeError, gradeData] = useGradeData(courseId)
  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'grade')
  const [settingChanged, setSettingChanged] = useState(false)
  const [showGrade, setShowGrade] = useState(true)

  useEffect(() => {
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setShowGrade(true)
      } else {
        setShowGrade(userSetting.default !== 'False')
      }
    }
  }, [userSettingLoaded])

  const [userSettingSaved, , userSettingResponse] = useSetUserSetting(
    courseId,
    { grade: showGrade },
    settingChanged,
    [showGrade]
  )

  if (gradeError) return (<WarningBanner />)

  const BuildGradeView = () => {
    const grades = gradeData.map(x => x.current_grade)

    const tableRows = [
      ['Average grade', <strong key={0}>{gradeData[0].grade_avg}%</strong>],
      ['Median grade', <strong key={1}>{gradeData[0].median_grade}%</strong>],
      ['Number of students', <strong key={2}>{gradeData[0].tot_students}</strong>],
      !user.admin && showGrade
        ? ([
          'My grade',
          <strong key={0}>
            {
              gradeData[0].current_user_grade
                ? `${roundToOneDecimal(gradeData[0].current_user_grade)}%`
                : 'There are no grades yet for you in this course'
            }
          </strong>
        ])
        : []
    ]

    const gradeCheckbox = !user.admin
      ? userSettingLoaded
        ? (
          <Typography align='right'>{'Show my grade'}
            <Checkbox
              color='primary'
              checked={showGrade}
              onChange={() => {
                setSettingChanged(true)
                setShowGrade(!showGrade)
              }}
            />
          </Typography>
        )
        : <Spinner />
      : null

    return (
      <Grid container>
        <Grid item xs={12} lg={2}>
          <Table className={classes.table} noBorder tableData={tableRows} />
        </Grid>
        <Grid item xs={12} lg={10}>
          {gradeCheckbox}
          <Histogram
            data={grades}
            aspectRatio={0.3}
            xAxisLabel='Grade %'
            yAxisLabel='Number of Students'
            myGrade={showGrade ? gradeData[0].current_user_grade : null}
            maxGrade={gradeData[0].graph_upper_limit}
            showNumberOnBars={gradeData[0].show_number_on_bars}
            showDashedLine={gradeData[0].show_dash_line}
          />
        </Grid>
      </Grid>
    )
  }

  if (gradeLoaded && isObjectEmpty(gradeData)) {
    return <AlertBanner>Grade data is not available.</AlertBanner>
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>Grade Distribution</Typography>
            {
              gradeLoaded
                ? <BuildGradeView />
                : <Spinner />
            }
            <UserSettingSnackbar
              saved={userSettingSaved}
              response={userSettingResponse}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(GradeDistribution)
