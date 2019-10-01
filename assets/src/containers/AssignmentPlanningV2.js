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
import { useQuery } from '@apollo/react-hooks'
import { calculateWeekOffset } from '../util/date'
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
  }
})

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
      setAssignments(
        data.course.assignments
          .map(assignment => {
            const {
              dueDate,
              pointsPossible,
              assignmentGroupId,
              currentUserSubmission
            } = assignment
            const courseStartDate = data.course.dateStart
            const assignmentGroups = data.course.assignmentGroups

            assignment.week = calculateWeekOffset(courseStartDate, dueDate)
            assignment.percentOfFinalGrade = calculateWeight(pointsPossible, assignmentGroupId, assignmentGroups)
            assignment.outOf = pointsPossible
            assignment.graded = !!currentUserSubmission.gradedDate
            return assignment
          }).sort((a, b) => a.week - b.week)
      )
      setCurrentGrade(
        calculateCurrentGrade(data.course.assignments, data.course.assignmentGroups)
      )
      setMaxPossibleGrade(
        calculateMaxGrade(data.course.assignments, data.course.assignmentGroups)
      )
    }
  }, [loading])

  // this effect is used to keep the goal of the course and assignments "in sync"
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
                          labelDown: true
                        }
                      ]}
                      outOf={100}
                      percentWidth={100}
                      height={50}
                    />
                    <AssignmentGradeBoxes
                      currentGrade={currentGrade}
                      goalGrade={goalGrade}
                      maxPossibleGrade={maxPossibleGrade}
                      setGoalGrade={grade => setGoalGrade(grade)}
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
