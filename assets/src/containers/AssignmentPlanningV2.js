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

import {
  assignmentStatus,
  clearGoals,
  setAssignmentGoalGrade,
  setAssignmentGoalLockState,
  setAssigmentGoalInputState
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
  goalAlign: {
    display: 'flex'
  },
  section: {
    paddingBottom: 10,
    paddingTop: 10
  },
  stickyTop: {
    position: 'sticky',
    top: 0,
    bottom: 20,
    // paddingTop: '40px',
    // paddingBottom: '40px',
    zIndex: 5
    // border: '2px solid #4CAF50'
  },
  clearButton: {
    float: 'right',
    margin: '30px'
  },
  mainProgressBar: {
    marginBottom: '50px'
  },
  graded: {
    width: '10px',
    height: '10px',
    background: theme.palette.secondary.main,
    display: 'inline-block'
  },
  ungraded: {
    width: '10px',
    height: '10px',
    background: theme.palette.info.main,
    display: 'inline-block'
  },
  unsubmitted: {
    width: '10px',
    height: '10px',
    background: theme.palette.negative.main,
    display: 'inline-block'
  }
})

function AssignmentPlanningV2 (props) {
  const { classes, disabled, courseId, isAdmin, enrollmentTypes } = props
  if (disabled && !isTeacherOrAdmin(isAdmin, enrollmentTypes)) return (<AlertBanner>The Assignment Planning view is hidden for this course.</AlertBanner>)

  const [assignments, setAssignments] = useState([])
  const [goalGrade, setGoalGrade] = useState('')
  const [goalGradePrev, setGoalGradePrev] = useState('')
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
    goalGradePrev,
    currentGrade,
    maxPossibleGrade,
    setAssignments,
    setUserSetting
  })

  const showMathWarning = useMathWarning(assignments)

  const [mutationLoading, mutationError] = useSaveUserSetting({
    loading,
    error,
    courseId,
    userSetting,
    settingChanged
  })

  const handleAssignmentGoalGrade = (key, assignmentGoalGrade) => {
    setSettingChanged(true)
    setAssignments(
      setAssignmentGoalGrade(key, assignments, assignmentGoalGrade)
    )
  }

  const handleClearGoalGrades = () => {
    setAssignments(clearGoals(assignments))
    setGoalGradePrev(goalGrade)
    setGoalGrade('')
    setSettingChanged(true)
  }

  const handleAssignmentLock = (key, checkboxState) => {
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
                    <div style={{ border: '2px solid red' }}>
                      <div className={classes.section + ' ' + classes.goalAlign + ' ' + classes.stickyTop}>
                        <AssignmentGoalInput
                          currentGrade={currentGrade}
                          goalGrade={goalGrade}
                          maxPossibleGrade={maxPossibleGrade}
                          setGoalGradePrev={grade => {
                            setGoalGradePrev(grade)
                          }}
                          setGoalGrade={grade => {
                            setSettingChanged(true)
                            setGoalGrade(grade)
                          }}
                          handleClearGoalGrades={handleClearGoalGrades}
                          mathWarning={showMathWarning}
                        />
                        <div style={{ flex: 4 }}>
                          <Typography variant='h6' gutterBottom>Grade Progress</Typography>
                          <ProgressBarV2
                            score={currentGrade}
                            lines={[
                              {
                                label: 'Current',
                                value: currentGrade,
                                color: 'steelblue',
                                labelPlacement: 'down1'
                              },
                              {
                                label: 'Goal',
                                value: goalGrade,
                                color: 'green',
                                labelPlacement: 'up1'
                              },
                              {
                                label: 'Max Possible',
                                value: maxPossibleGrade,
                                color: 'grey',
                                labelPlacement: 'down2'
                              }
                            ]}
                            outOf={100}
                            percentWidth={90}
                            height={50}
                            margin={50}
                          />
                        </div>
                      </div>
                      <div className={classes.section}>
                        <Grid container>
                          <Grid item xs={12} md={10}>
                            <Typography variant='h6' gutterBottom>Assignments by Due Date</Typography>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <Typography variant='h6'>Assignment Status</Typography>
                            <div className={classes.graded} />
                            <Typography style={{ display: 'inline' }}> {assignmentStatus.GRADED}</Typography>
                            <br />
                            <div className={classes.ungraded} />
                            <Typography style={{ display: 'inline' }}> {assignmentStatus.SUBMITTED}</Typography>
                            <br />
                            <div className={classes.unsubmitted} />
                            <Typography style={{ display: 'inline' }}> {assignmentStatus.UNSUBMITTED}</Typography>
                            <br />
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
                      </div>
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
