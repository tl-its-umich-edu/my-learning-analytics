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
import ViewHeader from '../components/ViewHeader'
import { roundToXDecimals } from '../util/math'
import { useGradeData } from '../service/api'
import { isObjectEmpty, isObjectGDLimit } from '../util/object'
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'
import { isTeacherOrAdmin } from '../util/roles'
import { Helmet } from 'react-helmet'

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
  const { classes, disabled, courseId, user, isAdmin, enrollmentTypes } = props
  if (disabled && !isTeacherOrAdmin(isAdmin, enrollmentTypes)) return (<AlertBanner>The Grade Distribution view is hidden for this course.</AlertBanner>)

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
    const grades = gradeData.grades

    const tableRows = [
      ['Average grade', <strong key={0}>{gradeData.summary.grade_avg}%</strong>],
      ['Median grade', <strong key={1}>{gradeData.summary.median_grade}%</strong>],
      ['Class Size', <strong key={2}>{gradeData.summary.tot_students}</strong>],
      !user.admin && showGrade
        ? ([
          'My grade',
          <strong key={0}>
            {
              gradeData.summary.current_user_grade
                ? `${roundToXDecimals(gradeData.summary.current_user_grade, 1)}%`
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
              color='secondary'
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
            myGrade={showGrade ? gradeData.summary.current_user_grade : null}
            gradesSummary={gradeData.summary}
          />
        </Grid>
      </Grid>
    )
  }

  let gradeContent
  if (gradeLoaded && isObjectEmpty(gradeData)) {
    gradeContent = (<AlertBanner>Grade data is not available.</AlertBanner>)
  } else if (gradeLoaded && isObjectGDLimit(gradeData)) {
    gradeContent = (<AlertBanner>{gradeData.gd_msg}</AlertBanner>)
  } else {
    gradeContent = gradeLoaded
      ? (<BuildGradeView />)
      : (<Spinner />)
  }

  return (
    <>
      <Helmet title='Grade Distribution' />
      {disabled ? <AlertBanner>Preview Mode: This view is currently disabled for students.</AlertBanner> : undefined}
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ViewHeader>Grade Distribution</ViewHeader>
              {gradeContent}
              <UserSettingSnackbar
                saved={userSettingSaved}
                response={userSettingResponse}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default withStyles(styles)(GradeDistribution)
