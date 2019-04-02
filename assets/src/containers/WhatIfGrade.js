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
import { roundToOneDecimcal, calculateWhatIfGrade, calculateActualGrade } from '../util/math'
import { useAssignmentPlanningData } from '../service/api'
import { formatDate, isValid } from '../util/data'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  sliderCell: {
    minWidth: '150px'
  }
})

function WhatIfGrade (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId

  const [loaded, assignmentData] = useAssignmentPlanningData(currentCourseId, 0)
  const [assignments, setAssignments] = useState(null)
  const [actualGrade, setActualGrade] = useState(0)
  const [whatIfGrade, setWhatIfGrade] = useState(0)

  useEffect(() => {
    if (loaded && isValid(assignmentData)) {
      const assignments = assignmentData.progress.reduce((acc, assignment, i) => {
        const assignmentName = assignment.name
        const isGraded = assignment.graded
        const dueDate = assignment.due_date_mod || ''
        const percentOfFinalGrade = assignment.towards_final_grade
        const actualGrade = isGraded
          ? roundToOneDecimcal(assignment.score / assignment.points_possible * 100)
          : null
        acc[i] = {
          assignmentName,
          isGraded,
          dueDate,
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

  const buildWhatIfGradeView = assignments => {
    if (!isValid(assignments)) {
      return (<p>No data provided</p>)
    }
    return (
      <>
        <Grid container justify='flex-end'>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Table
                  tableHead={['What-If Grade', 'Current Grade']}
                  tableData={[[
                    <Typography variant='h6'>
                      {`${whatIfGrade}% `}
                      {(whatIfGrade - actualGrade) > 0
                        ? <span style={{ color: 'green', display: 'inline' }}>
                          {`(+${roundToOneDecimcal(whatIfGrade - actualGrade)}%)`}
                        </span>
                        : <span style={{ color: 'red', display: 'inline' }}>
                          {`(${roundToOneDecimcal(whatIfGrade - actualGrade)}%)`}
                        </span>}
                    </Typography>,
                    <Typography variant='h6'>{`${actualGrade}%`}</Typography>
                  ]]} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <MTable className={classes.table}>
          <TableHead>
            <TableRow>
              {[
                'Assignment Name',
                'Due Date',
                'Weight',
                'Current Grade',
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
                    {formatDate(assignments[key].dueDate) || '-'}
                  </TableCell>
                  <TableCell>
                    {`${assignments[key].percentOfFinalGrade}%`}
                  </TableCell>
                  <TableCell>
                    {assignments[key].actualGrade ? `${assignments[key].actualGrade}%` : '-'}
                  </TableCell>
                  <TableCell className={classes.sliderCell}>
                    <GradeSlider
                      grade={assignments[key].whatIfGrade}
                      setWhatIfGrade={value => {
                        const assignment = assignments[key]
                        assignment.whatIfGrade = value
                        setAssignments({ ...assignments, [key]: assignment })
                      }}
                      isGraded={assignments[key].isGraded}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </MTable>
      </>
    )
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >What-If Grade Calculator</Typography >
            {loaded
              ? buildWhatIfGradeView(assignments)
              : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(WhatIfGrade)
