import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import ProgressBarV2 from '../components/ProgressBarV2'
import AssignmentGoalInput from '../components/AssignmentGoalInput'
import AlertBanner from '../components/AlertBanner'
import WarningBanner from '../components/WarningBanner'
import AssignmentTable from '../components/AssignmentTable'
import Typography from '@material-ui/core/Typography'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import useAssignmentData from '../hooks/useAssignmentData'
import useInitAssignmentState from '../hooks/useInitAssignmentState'
import useSyncAssignmentAndGoalGrade from '../hooks/useSyncAssignmentAndGoalGrade'
import useUserAssignmentSetting from '../hooks/useUserAssignmentSetting'
import useMathWarning from '../hooks/useMathWarning'
import useSaveUserSetting from '../hooks/useSaveUserSetting'
import {
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
  clearButton: {
    float: 'right',
    margin: '30px'
  },
  mainProgressBar: {
    marginBottom: '50px'
  }
})

function AssignmentPlanningV2 (props) {
  const { classes, disabled, courseId } = props
  if (disabled) return (<AlertBanner>Assignment Planning view is hidden for this course.</AlertBanner>)

  const [assignments, setAssignments] = useState([])
  const [goalGrade, setGoalGrade] = useState('')
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
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>Assignment Planning</Typography>
            {
              loading
                ? <Spinner />
                : (
                  <>
                    <Typography variant='h6'>Grade Progress</Typography>
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
                    <AssignmentGoalInput
                      currentGrade={currentGrade}
                      goalGrade={goalGrade}
                      maxPossibleGrade={maxPossibleGrade}
                      setGoalGrade={grade => {
                        setSettingChanged(true)
                        setGoalGrade(grade)
                      }}
                      handleClearGoalGrades={handleClearGoalGrades}
                      mathWarning={showMathWarning}
                    />
                    <Typography variant='h6'>Assignments by Due Date</Typography>
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
                  </>
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
  )
}

export default withStyles(styles)(AssignmentPlanningV2)
