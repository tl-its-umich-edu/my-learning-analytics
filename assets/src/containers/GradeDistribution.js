import React, { useState, useEffect } from 'react'
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
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

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
  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'grades')
  const [settingChanged, setSettingChanged] = useState(false)
  const [showGrade, setShowGrade] = useState(false)

  useEffect(() => {
    if (userSettingLoaded) {
      setShowGrade(userSetting.default !== 'False')
    }
  }, [userSettingLoaded])

  const [userSettingSaved, userSettingResponse] = useSetUserSetting(
    courseId,
    { grades: showGrade },
    settingChanged,
    [showGrade]
  )
  const [savedSnackbarOpen, setSavedSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    if (userSettingSaved) {
      if (userSettingResponse.default === 'success') {
        setSnackbarMessage('Setting saved successfully!')
      } else {
        setSnackbarMessage('Setting not saved.')
      }
      setSavedSnackbarOpen(true)
    }
  }, [userSettingSaved])

  if (gradeError) return (<Error>Something went wrong, please try again later.</Error>)
  if (gradeLoaded && isObjectEmpty(gradeData)) return (<Error>No data provided.</Error>)

  const BuildGradeView = () => {
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
              checked={showGrade}
              onChange={() => {
                setSettingChanged(true)
                setShowGrade(!showGrade)
              }} />
            </>
            : <Spinner />}
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            open={savedSnackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSavedSnackbarOpen(false)}
            message={<span>{snackbarMessage}</span>}
            action={[
              <IconButton
                key='close'
                aria-label='close'
                color='inherit'
                onClick={() => setSavedSnackbarOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
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
