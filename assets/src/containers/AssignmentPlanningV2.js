import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
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
import { eventLogExtra } from '../util/object'
import { roundToXDecimals } from '../util/math'

import {
  assignmentStatus,
  clearGoals,
  setAssignmentGoalGrade,
  setAssignmentGoalLockState,
  setAssigmentGoalInputState
} from '../util/assignment'

const PREFIX = 'AssignmentPlanningV2'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  section: `${PREFIX}-section`,
  mainProgressBar: `${PREFIX}-mainProgressBar`,
  assignStatus: `${PREFIX}-assignStatus`,
  legendItem: `${PREFIX}-legendItem`,
  legendItemLabel: `${PREFIX}-legendItemLabel`,
  graded: `${PREFIX}-graded`,
  ungraded: `${PREFIX}-ungraded`,
  unsubmitted: `${PREFIX}-unsubmitted`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
    padding: 8
  },

  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },

  [`& .${classes.section}`]: {
    paddingBottom: 10,
    paddingTop: 10
  },

  [`& .${classes.mainProgressBar}`]: {
    marginBottom: '2.5rem'
  },

  [`& .${classes.assignStatus}`]: {
    width: '10px',
    height: '10px',
    display: 'inline-block'
  },

  [`& .${classes.legendItem}`]: {
    display: 'inline-block',
    marginRight: '14px'
  },

  [`& .${classes.legendItemLabel}`]: {
    display: 'inline',
    marginLeft: '6px'
  },

  [`& .${classes.graded}`]: {
    background: theme.palette.secondary.main
  },

  [`& .${classes.ungraded}`]: {
    background: theme.palette.info.main
  },

  [`& .${classes.unsubmitted}`]: {
    background: theme.palette.negative.main
  }
}))

function AssignmentPlanningV2 (props) {
  const { disabled, courseId, isAdmin, enrollmentTypes } = props
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

  const handleAssignmentGoalGrade = (key, assignmentGoalGrade, prevGoalGrade) => {
    const v = {
      assignmentId: key,
      assignGoalGrade: assignmentGoalGrade,
      assignPrevGoalGrade: roundToXDecimals(prevGoalGrade, 1)
    }
    setEventLog(eventLogExtra(v, eventLog, currentGrade, maxPossibleGrade))
    setSettingChanged(true)
    setAssignments(
      setAssignmentGoalGrade(key, assignments, assignmentGoalGrade)
    )
  }

  const handleClearGoalGrades = () => {
    const v = { courseGoalGrade: '', prevCourseGoalGrade: goalGrade }
    setEventLog(eventLogExtra(v, eventLog, currentGrade, maxPossibleGrade))
    setAssignments(clearGoals(assignments))
    setGoalGrade('')
    setSettingChanged(true)
  }

  const handleAssignmentLock = (key, checkboxState) => {
    const assignment = assignments.filter(a => a.id === key)
    const v = { assignmentId: key, assignGoalGrade: roundToXDecimals(assignment[0].goalGrade, 1), checkboxLockState: checkboxState }
    setEventLog(eventLogExtra(v, eventLog, currentGrade, maxPossibleGrade))
    setAssignments(
      setAssignmentGoalLockState(key, assignments, checkboxState)
    )
  }

  const handleInputFocus = key => {
    setAssignments(
      setAssigmentGoalInputState(key, assignments, true)
    )
  }

  const handleInputBlur = key => {
    setAssignments(
      setAssigmentGoalInputState(key, assignments, false)
    )
  }

  if (error) return (<WarningBanner />)

  return (
    <Root>
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
                      <div role='region' aria-label='goal and progress'>
                        <Grid container alignContent='center' className={classes.section}>
                          <Grid item lg={4} md={5} xs={12}>
                            <Typography variant='h6' gutterBottom>My Minimum Goal (%)</Typography>
                            <AssignmentGoalInput
                              currentGrade={currentGrade}
                              goalGrade={goalGrade}
                              maxPossibleGrade={maxPossibleGrade}
                              eventLog={eventLog}
                              setEventLog={eventLog => {
                                setEventLog(eventLog)
                              }}
                              setGoalGrade={grade => {
                                setSettingChanged(true)
                                setGoalGrade(grade)
                              }}
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
                      </div>
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
                        handleInputFocus={handleInputFocus}
                        handleInputBlur={handleInputBlur}
                      />
                    </div>)
              }
              <UserSettingSnackbar
                saved={!mutationError && !mutationLoading && settingChanged}
                response={{ default: 'success' }}
              />
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Root>
  )
}

export default (AssignmentPlanningV2)
