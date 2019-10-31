import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import ProgressBarV2 from '../components/ProgressBarV2'
import AssignmentGradeBoxes from '../components/AssignmentGradeBoxes'
import AlertBanner from '../components/AlertBanner'
import WarningBanner from '../components/WarningBanner'
import AssignmentTable from '../components/AssignmentTable'
import Typography from '@material-ui/core/Typography'
import {
  createUserSettings
} from '../util/assignment'
import useAssignmentData from '../hooks/useAssignmentData'
import useInitalizeAssignmentState from '../hooks/useInitalizeAssignmentState'
import useSyncAssignmentAndGoalGrade from '../hooks/useSyncAssignmentAndGoalGrade'
import useAssignmentUserSetting from '../hooks/useAssignmentUserSetting'
import useSetUserSettingGQL from '../hooks/useSetUserSettingGQL'
// import { DndProvider } from 'react-dnd'
// import HTML5Backend from 'react-dnd-html5-backend'

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
  if (disabled) return (<AlertBanner>Grade Distribution view is hidden for this course.</AlertBanner>)

  const [assignments, setAssignments] = useState([])
  const [goalGrade, setGoalGrade] = useState(null)
  const [currentGrade, setCurrentGrade] = useState(0)
  const [maxPossibleGrade, setMaxPossibleGrade] = useState(0)
  const [userSetting, setUserSetting] = useState({})

  const { loading, error, data } = useAssignmentData(courseId)
  console.log(data)
  const { debouncedUpdateUserSetting, mutationLoading, mutationError } = useSetUserSettingGQL()

  const setHandleAssignmentGoalGrade = (key, assignmentGoalGrade) => {
    setAssignments([
      ...assignments.slice(0, key),
      {
        ...assignments[key],
        goalGrade: Number(assignmentGoalGrade),
        goalGradeSetByUser: true
      },
      ...assignments.slice(key + 1)
    ])
  }

  const handleClearGoalGrades = () => {
    setAssignments(
      assignments.map(a => {
        a.goalGrade = ''
        a.goalGradeSetByUser = null
        return a
      })
    )
    setGoalGrade(null)
    setUserSetting({})
  }

  // initialize the state

  // need this to indicate when user setting is saved
  useEffect(() => {
    if (!mutationLoading && !mutationError) {

    }
  }, [mutationLoading])
  useInitalizeAssignmentState(
    loading,
    error,
    data,
    setAssignments,
    setCurrentGrade,
    setMaxPossibleGrade,
    setUserSetting
  )
  useAssignmentUserSetting(loading, error, assignments, userSetting, setGoalGrade, setAssignments)
  useSyncAssignmentAndGoalGrade(data, assignments, goalGrade, setAssignments, setUserSetting)

  // this effect saves the user setting
  useEffect(() => {
    debouncedUpdateUserSetting(
      createUserSettings(courseId, 'assignment', userSetting)
    )
  }, [JSON.stringify(userSetting)])

  if (error) return (<WarningBanner />)

  return (
    // <DndProvider backend={HTML5Backend}>
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
                    <ProgressBarV2
                      score={currentGrade}
                      lines={[
                        {
                          label: 'Current',
                          value: currentGrade,
                          color: 'steelblue',
                          labelDown: true
                        },
                        {
                          label: 'Goal',
                          value: goalGrade,
                          color: 'green',
                          labelUp: true
                        },
                        {
                          label: 'Max Possible',
                          value: maxPossibleGrade,
                          color: 'grey',
                          labelDownLower: true
                        }
                      ]}
                      outOf={100}
                      percentWidth={90}
                      height={50}
                      margin={50}
                    />
                    <AssignmentGradeBoxes
                      currentGrade={currentGrade}
                      goalGrade={goalGrade}
                      maxPossibleGrade={maxPossibleGrade}
                      setGoalGrade={grade => setGoalGrade(grade)}
                      handleClearGoalGrades={handleClearGoalGrades}
                    />
                    <AssignmentTable
                      assignments={assignments}
                      setGoalGrade={setHandleAssignmentGoalGrade}
                    />
                  </>
                )
            }
          </Paper>
        </Grid>
      </Grid>
    </div>
    // </DndProvider>
  )
}

export default withStyles(styles)(AssignmentPlanningV2)
