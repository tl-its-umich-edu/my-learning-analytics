import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import MTable from '@material-ui/core/Table'
import Table from '../components/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import Spinner from '../components/Spinner'
import GradeSlider from '../components/GradeSlider'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { roundToOneDecimcal } from '../util/math'
import { useAssignmentPlanningData } from '../service/api'

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

function WhatIfGrade (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId

  const [assignments, setAssignments] = useState(null)
  const [actualGrade, setActualGrade] = useState(0)
  const [whatIfGrade, setWhatIfGrade] = useState(0)
  const [showWeightedScores, setShowWeightedScores] = useState(false)
  const [loaded, assignmentData] = useAssignmentPlanningData(currentCourseId, 0)

  const calculateActualGrade = assignmentData => {
    const gradedAssignments = assignmentData.progress.filter(x => x.graded)
    const [totalPointsEarned, totalPointsPossible] = gradedAssignments.reduce((acc, cur) => {
      acc[0] += cur.percent_gotten
      acc[1] += cur.towards_final_grade
      return acc
    }, [0, 0])
    return roundToOneDecimcal(totalPointsEarned / totalPointsPossible * 100)
  }

  const calculateWhatIfGrade = assignments => {
    const arrOfAssignments = Object.keys(assignments).map(key => assignments[key])
    const whatIfGrade = arrOfAssignments
      .reduce((acc, cur) => (acc += cur.percentOfFinalGrade * cur.whatIfGrade / 100), 0)
    return roundToOneDecimcal(whatIfGrade)
  }

  useEffect(() => {
    if (loaded) {
      const assignments = assignmentData.progress.reduce((acc, assignment, i) => {
        const assignmentName = assignment.name
        const isGraded = assignment.graded
        const actualGrade = isGraded
          ? roundToOneDecimcal(assignment.score / assignment.points_possible * 100)
          : null
        const percentOfFinalGrade = assignment.towards_final_grade
        acc[i] = {
          assignmentName,
          isGraded,
          actualGrade,
          percentOfFinalGrade,
          whatIfGrade: isGraded ? actualGrade : 100
        }
        return acc
      }, {})
      setAssignments(assignments)
      setActualGrade(calculateActualGrade(assignmentData))
    }
  }, [loaded])

  useEffect(() => {
    if (assignments) {
      setWhatIfGrade(calculateWhatIfGrade(assignments))
    }
  })

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>What-If Grade Calculator</Typography>
            {assignments
              ? <>
                <Grid container justify='flex-end'>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Table tableData={[
                          ['Current Grade', <strong>{`${actualGrade}%`}</strong>],
                          ['What-If Grade', <strong>{`${whatIfGrade}%`} {(whatIfGrade - actualGrade) > 0
                            ? <p style={{ color: 'green', display: 'inline' }}>{`(+${roundToOneDecimcal(whatIfGrade - actualGrade)}%)`}</p>
                            : <p style={{ color: 'red', display: 'inline' }}>{`(${roundToOneDecimcal(whatIfGrade - actualGrade)}%)`}</p>}</strong>]
                        ]} />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <MTable className={classes.table}>
                  <TableHead>
                    <TableRow>
                      {[
                        'Assignment Name',
                        'What-If Grade'
                      ].map((prop, key) => {
                        return (
                          <TableCell
                            className={classes.tableCell + ' ' + classes.tableHeadCell}
                            key={key}>
                            {prop}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(assignments).map(key => {
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            {assignments[key].assignmentName}
                          </TableCell>
                          <TableCell>
                            <GradeSlider
                              grade={assignments[key].whatIfGrade}
                              setWhatIfGrade={value => {
                                const assignment = assignments[key]
                                assignment.whatIfGrade = value
                                setAssignments({ ...assignments, [key]: assignment })
                              }}
                              isGraded={assignments[key].isGraded}
                              weight={assignments[key].percentOfFinalGrade}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })
                    }
                  </TableBody>
                </MTable>
              </> : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(WhatIfGrade)
