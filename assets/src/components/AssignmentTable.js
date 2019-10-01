import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import MTable from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TextField from '@material-ui/core/TextField'
import ProgressBarV2 from './ProgressBarV2'

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
  },
  numberField: {
    width: 60
  }
})

function AssignmentTable (props) {
  const { classes, assignments, setGoalGrade } = props

  const maxPercentOfFinalGrade = Math.max(
    ...assignments
      .map(({ percentOfFinalGrade }) => percentOfFinalGrade)
  )

  return (
    <MTable className={classes.table}>
      <TableHead>
        <TableRow>
          {
            [
              'Week',
              'Due',
              'Assignment Name',
              'Percent of Final Grade',
              'Score / Out of'
            ].map((heading, key) => (
              <TableCell
                className={classes.tableCell + ' ' + classes.tableHeadCell}
                key={key}
              >
                {heading}
              </TableCell>
            ))
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          assignments.map((assignment, key) => (
            <TableRow key={key}>
              <TableCell>
                {assignment.week ? `Week ${assignment.week}` : ``}
              </TableCell>
              <TableCell>
                {assignment.dueDate}
              </TableCell>
              <TableCell>
                {assignment.name}
              </TableCell>
              <TableCell>
                <ProgressBarV2
                  score={assignment.currentUserSubmission.score}
                  outOf={assignment.outOf}
                  goalGrade={assignment.goalGrade}
                  percentWidth={assignment.percentOfFinalGrade / maxPercentOfFinalGrade * 70}
                  displayLabel
                  lines={
                    assignment.goalGrade
                      ? [{ color: 'green', value: assignment.goalGrade, draggable: true }]
                      : []
                  }
                />
                <>{`${assignment.percentOfFinalGrade}%`}</>
              </TableCell>
              <TableCell>
                {
                  assignment.graded || assignment.outOf == 0
                    ? assignment.outOf === 0 ? `0` : `${assignment.currentUserSubmission.score}`

                    : (
                      <TextField
                        id='standard-number'
                        value={
                          Object.prototype.hasOwnProperty.call(assignment, 'goalGrade')
                            ? assignment.goalGrade
                            : assignment.outOf
                        }
                        onChange={event => setGoalGrade(key, event.target.value)}
                        type='number'
                        className={classes.numberField}
                      />
                    )
                }
                {
                  <div style={{ margin: 'auto', display: 'inline' }}>
                    {` / ${assignment.outOf}`}
                  </div>
                }
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </MTable>
  )
}

export default withStyles(styles)(AssignmentTable)
