import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import ProgressBarV2 from '../components/ProgressBarV2'
import AssignmentGradeBoxes from '../components/AssignmentGradeBoxes'
import Error from './Error'
import AssignmentTable from '../components/AssignmentTable'
import Typography from '@material-ui/core/Typography'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { calculateWeekOffset, dateToMonthDay } from '../util/date'
import {
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  calculateAssignmentGoalsFromCourseGoal,
  sumAssignmentGoalGrade
} from '../util/assignment'
// import { DndProvider } from 'react-dnd'
// import HTML5Backend from 'react-dnd-html5-backend'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
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

const updateUserSetting = courseId => gql`
  mutation setUserDefaultSelection($input: UserDefaultSelectionInput!) {
    setUserDefaultSelection(data: $input) {
      userDefaultSelection {
        courseId,
        defaultViewType,
        defaultViewValue,
      }
    }
  }
`

function AssignmentPlanningV2 (props) {
  const { classes, disabled, courseId } = props
  if (disabled) return (<Error>Grade Distribution view is hidden for this course.</Error>)

  const [assignments, setAssignments] = useState([])
  const [goalGrade, setGoalGrade] = useState(null)
  const [currentGrade, setCurrentGrade] = useState(0)
  const [maxPossibleGrade, setMaxPossibleGrade] = useState(0)

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

  const handleResetClick = () => {
    setAssignments(
      assignments.map(a => {
        a.goalGrade = ''
        a.goalGradeSetByUser = null
        return a
      })
    )
    setGoalGrade(null)
  }

  const { loading, error, data } = useQuery(gql`
    {
      course(canvasId: ${courseId}) {
        assignments {
          name
          dueDate
          pointsPossible
          averageGrade
          assignmentGroupId
          currentUserSubmission {
            score
            gradedDate
          }
        }
        dateStart
        assignmentWeightConsideration
        assignmentGroups{
          weight
          id
          groupPoints
        }
      }
    }
  `)

  useEffect(() => {
    if (!loading && !error) {
      const course = data.course
      setAssignments(
        course.assignments
          .map(a => {
            const {
              dueDate,
              pointsPossible,
              assignmentGroupId,
              currentUserSubmission
            } = a

            const courseStartDate = course.dateStart
            const assignmentGroups = course.assignmentGroups

            a.week = calculateWeekOffset(courseStartDate, dueDate)
            a.percentOfFinalGrade = calculateWeight(pointsPossible, assignmentGroupId, assignmentGroups)
            a.outOf = pointsPossible
            a.graded = !!currentUserSubmission.gradedDate
            a.dueDate = dateToMonthDay(dueDate)
            return a
          }).sort((a, b) => a.week - b.week)
      )
      setCurrentGrade(
        calculateCurrentGrade(course.assignments, course.assignmentGroups)
      )
      setMaxPossibleGrade(
        calculateMaxGrade(course.assignments, course.assignmentGroups)
      )
    }
  }, [loading])

  // this effect is used to keep the goal of the course and assignments "in sync"
  // run if goalGrade changes, or if the sum of goal grades set by user changes
  useEffect(() => {
    if (goalGrade) {
      setAssignments(
        calculateAssignmentGoalsFromCourseGoal(
          goalGrade,
          assignments,
          data.course.assignmentGroups
        )
      )
    }
  }, [goalGrade, sumAssignmentGoalGrade(assignments)])

  if (error) return (<Error>Something went wrong, please try again later.</Error>)

  return (
    // <DndProvider backend={HTML5Backend}>
    <div className={classes.root}>
      <Grid container spacing={16}>
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
                      handleResetClick={handleResetClick}
                    />
                    {/* <Button
                      variant='contained'
                      className={classes.clearButton}
                      onClick={handleResetClick}
                    >
                      {'Clear goal grades'}
                    </Button> */}
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
