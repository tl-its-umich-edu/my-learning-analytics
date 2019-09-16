import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import ProgressBarV2 from '../components/ProgressBarV2'
import AssignmentGradeBoxes from '../components/AssignmentGradeBoxes'
import Error from './Error'
import AssignmentTable from '../components/AssignmentTable'
import Typography from '@material-ui/core/Typography'

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

const grades = {
  currentGrade: 85,
  goalGrade: 90,
  maxPossibleGrade: 95,
  assignments: [
    {
      week: 1,
      dueDate: '10/15',
      title: 'Attendance',
      graded: true,
      score: 1,
      outOf: 1,
      percentOfFinalGrade: 5
    },
    {
      week: 1,
      dueDate: '10/15',
      title: 'Group Project',
      graded: true,
      score: 90,
      outOf: 100,
      percentOfFinalGrade: 15
    },
    {
      week: 2,
      dueDate: '10/22',
      title: 'Attendance',
      graded: false,
      score: null,
      outOf: 1,
      percentOfFinalGrade: 1
    },
    {
      week: 2,
      dueDate: '10/24',
      title: 'Discussion',
      graded: false,
      score: null,
      outOf: 5,
      percentOfFinalGrade: 20
    }
  ]
}

function AssignmentPlanningV2 (props) {
  const { classes, disabled, courseId } = props

  const [assignments, setAssignments] = useState(grades.assignments)
  const [goalGrade, setGoalGrade] = useState(grades.goalGrade)

  const setHandleAssignmentGoalGrade = (key, assignmentGoalGrade) => {
    setAssignments([
      ...assignments.slice(0, key),
      { ...assignments[key], goalGrade: assignmentGoalGrade },
      ...assignments.slice(key + 1)
    ])
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <>
              <Typography variant='h5' gutterBottom>Assignment Planning</Typography>
              <ProgressBarV2
                score={grades.currentGrade}
                lines={[
                  {
                    label: 'Current',
                    value: grades.currentGrade,
                    color: 'steelblue'
                  },
                  {
                    label: 'Goal',
                    value: grades.goalGrade,
                    color: 'green'
                  },
                  {
                    label: 'Max Possible',
                    value: grades.maxPossibleGrade,
                    color: 'grey'
                  }
                ]}
                outOf={100}
                percentWidth={100}
                height='70px'
              />
              <AssignmentGradeBoxes
                currentGrade={grades.currentGrade}
                goalGrade={goalGrade}
                maxPossibleGrade={grades.maxPossibleGrade}
                setGoalGrade={grade => setGoalGrade(grade)}
              />
              <AssignmentTable
                assignments={assignments}
                setGoalGrade={setHandleAssignmentGoalGrade}
              />
            </>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanningV2)
