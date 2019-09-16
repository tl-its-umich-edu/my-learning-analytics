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
    width: 30
  }
})

function AssignmentTable (props) {
  const { classes, assignments, setWhatIfGrade } = props

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
              'Table',
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
                {`Week ${assignment.week}`}
              </TableCell>
              <TableCell>
                {assignment.dueDate}
              </TableCell>
              <TableCell>
                {assignment.title}
              </TableCell>
              <TableCell>
                <ProgressBarV2
                  score={assignment.score}
                  outOf={assignment.outOf}
                  goalGrade={assignment.goalGrade}
                  percentWidth={assignment.percentOfFinalGrade / maxPercentOfFinalGrade * 70}
                  displayLabel
                />
                <>{`${assignment.percentOfFinalGrade}%`}</>
              </TableCell>
              <TableCell>
                {
                  assignment.graded
                    ? `${assignment.score}`
                    : (
                      <TextField
                        id='standard-number'
                        value={
                          Object.prototype.hasOwnProperty.call(assignment, 'whatIfGrade')
                            ? assignment.whatIfGrade
                            : assignment.outOf
                        }
                        onChange={event => setWhatIfGrade(key, event.target.value)}
                        type='number'
                        className={classes.numberField}
                      />
                    )
                }{<div style={{ margin: 'auto', display: 'inline' }}>{` / ${assignment.outOf}`}</div>}
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </MTable>
  )
}

export default withStyles(styles)(AssignmentTable)
