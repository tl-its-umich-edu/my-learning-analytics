import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import AlertBanner from '../components/AlertBanner'
import AssignmentGoalInput from '../components/AssignmentGoalInput'
import AssignmentTable from '../components/AssignmentTable'
import ProgressBarV2 from '../components/ProgressBarV2'
import Spinner from '../components/Spinner'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import ViewHeader from '../components/ViewHeader'
import WarningBanner from '../components/WarningBanner'
import useAssignmentData from '../hooks/useAssignmentData'
import useInitAssignmentState from '../hooks/useInitAssignmentState'
import useMathWarning from '../hooks/useMathWarning'
import useSaveUserSetting from '../hooks/useSaveUserSetting'
import useSyncAssignmentAndGoalGrade from '../hooks/useSyncAssignmentAndGoalGrade'
import useUserAssignmentSetting from '../hooks/useUserAssignmentSetting'
import { isTeacherOrAdmin } from '../util/roles'
import { Helmet } from 'react-helmet'
import { createEventLog } from '../util/object'
import { roundToXDecimals } from '../util/math'
import {
  assignmentStatus,
  clearGoals,
  setAssignmentGoalGrade,
  setAssignmentGoalLockState
} from '../util/assignment'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  section: {
    paddingBottom: 10,
    paddingTop: 10
  },
  clearButton: {
    float: 'right',
    margin: '30px'
  },
  mainProgressBar: {
    marginBottom: '2.5rem'
  },
  assignStatus: {
    width: '10px',
    height: '10px',
    display: 'inline-block'
  },
  legendItem: {
    display: 'inline-block',
    marginRight: '14px'
  },
  legendItemLabel: {
    display: 'inline',
    marginLeft: '6px'
  },
  graded: {
    background: theme.palette.secondary.main
  },
  ungraded: {
    background: theme.palette.info.main
  },
  unsubmitted: {
    background: theme.palette.negative.main
  }
})

function AssignmentPlanningV2 (props) {
  const { classes, disabled, courseId, isAdmin, enrollmentTypes } = props
  if (disabled && !isTeacherOrAdmin(isAdmin, enrollmentTypes)) return (<AlertBanner>The Assignment Planning view is hidden for this course.</AlertBanner>)

  const [assignments, setAssignments] = useState([])
  const [goalGrade, setGoalGrade] = useState('')
  const [eventLog, setEventLog] = useState({ count: 0, eLog: {} })
  const [userSetting, setUserSetting] = useState({})
  const [settingChanged, setSettingChanged] = useState(false)

  const { loading, error, data } = useAssignmentData(courseId)

  const [assignmentGroups, currentGrade, maxPossibleGrade] = useInitAssignmentState({
    loading,
    error,
    data,
    setAssignments,
    setUserSetting
  })

  useUserAssignmentSetting({
    loading,
    error,
    assignments,
    userSetting,
    setGoalGrade,
    setAssignments
  })

  useSyncAssignmentAndGoalGrade({
    data,
    assignments,
    goalGrade,
    currentGrade,
    maxPossibleGrade,
    setAssignments,
    setUserSetting,
    eventLog
  })

  const showMathWarning = useMathWarning(assignments)

  const [mutationLoading, mutationError] = useSaveUserSetting({
    loading,
    error,
    courseId,
    userSetting,
    settingChanged
  })

  const handleGoalGrade = (goalGrade, prevGoalGrade) => {
    const v = { courseGoalGrade: goalGrade }
    if (goalGrade !== '') {
      v.prevCourseGoalGrade = prevGoalGrade
    }
    setEventLog(createEventLog(v, eventLog, currentGrade, maxPossibleGrade))
    setSettingChanged(true)
    setGoalGrade(goalGrade)
  }

  const handleAssignmentGoalGrade = key => (goalGrade, prevGoalGrade) => {
    const v = {
      assignmentId: key,
      assignGoalGrade: goalGrade,
      assignPrevGoalGrade: roundToXDecimals(prevGoalGrade, 1)
    }
    setEventLog(createEventLog(v, eventLog, currentGrade, maxPossibleGrade))
    setSettingChanged(true)
    setAssignments(
      setAssignmentGoalGrade(key, assignments, goalGrade)
    )
  }

  const handleClearGoalGrades = () => {
    const v = { courseGoalGrade: '', prevCourseGoalGrade: goalGrade }
    setEventLog(createEventLog(v, eventLog, currentGrade, maxPossibleGrade))
    setAssignments(clearGoals(assignments))
    setGoalGrade('')
    setSettingChanged(true)
  }

  const handleAssignmentLock = (key, checkboxState) => {
    const assignment = assignments.filter(a => a.id === key)
    const v = { assignmentId: key, assignGoalGrade: roundToXDecimals(assignment[0].goalGrade, 1), checkboxLockState: checkboxState }
    setEventLog(createEventLog(v, eventLog, currentGrade, maxPossibleGrade))
    setAssignments(
      setAssignmentGoalLockState(key, assignments, checkboxState)
    )
  }

  if (error) return (<WarningBanner />)

  return (
    <>
      <Helmet title='Assignment Planning' />
      {disabled ? <AlertBanner>Preview Mode: This view is currently disabled for students.</AlertBanner> : undefined}
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ViewHeader>Assignment Planning</ViewHeader>
              {
                loading
                  ? <Spinner />
                  : (
                    <div>
                      <Grid container alignContent='center' className={classes.section}>
                        <Grid item lg={4} md={5} xs={12}>
                          <Typography variant='h6' gutterBottom>My Minimum Goal (%)</Typography>
                          <AssignmentGoalInput
                            currentGrade={currentGrade}
                            goalGrade={goalGrade}
                            maxPossibleGrade={maxPossibleGrade}
                            eventLog={eventLog}
                            setGoalGrade={newGoalGrade => handleGoalGrade(newGoalGrade, goalGrade)}
                            handleClearGoalGrades={handleClearGoalGrades}
                            mathWarning={showMathWarning}
                          />
                        </Grid>
                        <Grid item lg={8} md={7} xs={12} className={classes.mainProgressBar}>
                          <Typography variant='h6' gutterBottom>Grade Progress</Typography>
                          <ProgressBarV2
                            score={currentGrade}
                            lines={[
                              {
                                label: 'Current',
                                value: currentGrade,
                                color: 'steelblue',
                                placement: 'down1'
                              },
                              {
                                label: 'Goal',
                                value: goalGrade,
                                color: 'green',
                                placement: 'up1'
                              },
                              {
                                label: 'Max Possible',
                                value: maxPossibleGrade,
                                color: 'grey',
                                placement: 'down2'
                              }
                            ]}
                            outOf={100}
                            percentWidth={100}
                            height={50}
                          />
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={6} md={8}>
                          <Typography variant='h6' gutterBottom>Assignments by Due Date</Typography>
                        </Grid>
                        <Grid item xs={6} md={4} style={{ marginBottom: '1rem' }}>
                          <Typography variant='h6' gutterBottom>Assignment Status</Typography>
                          <div className={classes.legendItem}>
                            <div className={classes.graded + ' ' + classes.assignStatus} />
                            <Typography className={classes.legendItemLabel}>{assignmentStatus.GRADED}</Typography>
                          </div>
                          <div className={classes.legendItem}>
                            <div className={classes.ungraded + ' ' + classes.assignStatus} />
                            <Typography className={classes.legendItemLabel}>{assignmentStatus.SUBMITTED}</Typography>
                          </div>
                          <div className={classes.legendItem}>
                            <div className={classes.unsubmitted + ' ' + classes.assignStatus} />
                            <Typography className={classes.legendItemLabel}>{assignmentStatus.UNSUBMITTED}</Typography>
                          </div>
                        </Grid>
                      </Grid>
                      <AssignmentTable
                        courseGoalGradeSet={goalGrade !== ''}
                        assignments={assignments}
                        assignmentGroups={assignmentGroups}
                        dateStart={data.course.dateStart}
                        handleAssignmentGoalGrade={handleAssignmentGoalGrade}
                        handleAssignmentLock={handleAssignmentLock}
                      />
                    </div>
                  )
              }
              <UserSettingSnackbar
                saved={!mutationError && !mutationLoading && settingChanged}
                response={{ default: 'success' }}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

export default withStyles(styles)(AssignmentPlanningV2)
