import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import Grid from '@material-ui/core/Grid'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Select from '@material-ui/core/Select'
import Typography from '@material-ui/core/Typography'
import { AssignmentPlanningTooltip } from '../components/Tooltip'
import AlertBanner from '../components/AlertBanner'
import ProgressBar from '../components/ProgressBar'
import Spinner from '../components/Spinner'
import TableAssignment from '../components/TableAssignment'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import WarningBanner from '../components/WarningBanner'
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'
import { useAssignmentData } from '../service/api'
import { getCurrentWeek } from '../util/data'
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
  graded: {
    width: '10px',
    height: '10px',
    background: 'lightskyblue',
    display: 'inline-block'
  },
  ungraded: {
    width: '10px',
    height: '10px',
    background: 'gray',
    display: 'inline-block'
  }
})

const currentSetting = 'My current setting'
const rememberSetting = 'Remember my setting'
const settingNotUpdated = 'Setting not updated'

const assignmentTable = assignmentData => {
  if (!assignmentData || Object.keys(assignmentData).length === 0) {
    return (<AlertBanner>No assignments meet the selected criteria.</AlertBanner>)
  }
  return <TableAssignment
    tableHead={['Week', 'Due', 'Title', 'Percent of final grade']}
    tableData={assignmentData}
    currentWeek={getCurrentWeek(assignmentData)}
  />
}

function AssignmentPlanning (props) {
  const { classes, disabled, courseId } = props
  if (disabled) return (<AlertBanner>The Assignment Planning view is hidden for this course.</AlertBanner>)

  const [showSaveSetting, setShowSaveSetting] = useState(false)
  const [saveSettingClicked, setSaveSettingClicked] = useState(false)

  // this is the filter setting currently set
  const [assignmentGradeFilter, setAssignmentGradeFilter] = useState('')
  // this is the filter setting last saved by the user
  const [userSavedFilterSetting, setUserSavedFilterSetting] = useState(assignmentGradeFilter)
  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'assignment')
  const [assignmentLoaded, assignmentError, assignmentData] = useAssignmentData(courseId, assignmentGradeFilter, !userSettingLoaded)
  const [saveLabel, setSaveLabel] = useState(currentSetting)

  const [userSettingSaved, savingError, userSettingResponse] = useSetUserSetting(
    courseId,
    { assignment: assignmentGradeFilter },
    userSavedFilterSetting !== assignmentGradeFilter && saveSettingClicked, // only save if the filter setting last saved does not equal the current grade filter, and checkbox is checked.
    [saveSettingClicked]
  )

  useEffect(() => {
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setAssignmentGradeFilter(0)
      } else {
        setAssignmentGradeFilter(Number(userSetting.default))
        setUserSavedFilterSetting(Number(userSetting.default))
      }
    }
  }, [userSettingLoaded])

  useEffect(() => {
    // if user setting is different from current grade filter, show label for remembering setting
    if (userSavedFilterSetting !== assignmentGradeFilter) {
      setSaveLabel(rememberSetting)
    } else if (savingError) {
      setSaveLabel(settingNotUpdated)
    } else {
      setSaveLabel(currentSetting)
    }
  })

  // if user setting is saved, don't show checkbox and sync userSavedFilterSetting with assignmentGradeFilter
  useEffect(() => {
    if (userSettingSaved) {
      setShowSaveSetting(false)
      setUserSavedFilterSetting(assignmentGradeFilter)
    }
  }, [userSettingSaved])

  const handleAssignmentFilter = event => {
    const value = event.target.value
    setAssignmentGradeFilter(value)

    if (userSavedFilterSetting !== value) {
      setSaveSettingClicked(false)
      setShowSaveSetting(true)
    } else {
      setShowSaveSetting(false)
    }
  }

  if (assignmentError) return (<WarningBanner/>)

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <>
              <Typography variant='h5' gutterBottom>Progress toward Final Grade</Typography>
              {assignmentData
                ? <ProgressBar
                  data={assignmentData.progress}
                  aspectRatio={0.12}
                  tip={AssignmentPlanningTooltip(classes)} />
                : <Spinner />}
            </ >
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container>
              <Grid item xs={12} md={10}>
                <Typography variant='h5' gutterBottom>Assignments Due by Date</Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant='h6'>Assignment Status</Typography>
                <div className={classes.graded} />
                <Typography style={{ display: 'inline' }}> Graded</Typography>
                <br />
                <div className={classes.ungraded} />
                <Typography style={{ display: 'inline' }}> Not Yet Graded</Typography>
                <br />
              </Grid>
            </Grid>
            <FormControl>
              <Typography>Show assignments that weigh at least</Typography>
              <div style={{ display: 'flex' }}>
                <Select
                  value={assignmentGradeFilter}
                  onChange={handleAssignmentFilter}
                >
                  <MenuItem value={0}>0% (all)</MenuItem>
                  <MenuItem value={2}>2%</MenuItem>
                  <MenuItem value={5}>5%</MenuItem>
                  <MenuItem value={10}>10%</MenuItem>
                  <MenuItem value={20}>20%</MenuItem>
                  <MenuItem value={50}>50%</MenuItem>
                  <MenuItem value={75}>75%</MenuItem>
                </Select>
                {showSaveSetting
                  ? <Checkbox
                    checked={saveSettingClicked}
                    onChange={() => setSaveSettingClicked(!saveSettingClicked)}
                    value='checked'
                    color='primary'
                  />
                  : null
                }
                <div style={{ padding: '15px 2px' }}>{saveLabel}</div>
              </div>
            </FormControl>
            <UserSettingSnackbar
              saved={userSettingSaved}
              response={userSettingResponse}
              successMessage={'Assignment filter setting saved!'} />
            { /* in case of no data empty list is sent */}
            {assignmentLoaded ? assignmentTable(assignmentData.plan) : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanning)
