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
    width: 90
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
          assignments.map((a, key) => (
            <TableRow key={key}>
              <TableCell>
                {assignments.week ? `Week ${a.week}` : ``}
              </TableCell>
              <TableCell>
                {a.dueDate}
              </TableCell>
              <TableCell>
                {a.name}
              </TableCell>
              <TableCell>
                <ProgressBarV2
                  score={a.currentUserSubmission.score}
                  outOf={a.outOf}
                  goalGrade={a.goalGrade}
                  percentWidth={a.percentOfFinalGrade / maxPercentOfFinalGrade * 70}
                  displayLabel
                  lines={
                    a.goalGrade
                      ? [{ color: 'green', value: a.goalGrade, draggable: true }]
                      : []
                  }
                />
                <>{`${a.percentOfFinalGrade}%`}</>
              </TableCell>
              <TableCell>
                {
                  a.graded || a.outOf === 0
                    ? a.outOf === 0
                      ? '0'
                      : `${a.currentUserSubmission.score}`

                    : (
                      <TextField
                        error={a.goalGrade > 100}
                        id='standard-number'
                        value={
                          Object.prototype.hasOwnProperty.call(a, 'goalGrade')
                            ? a.goalGrade
                            : ''
                        }
                        label={
                          a.goalGrade > 100
                            ? 'Over 100%'
                            : 'Set a goal'
                        }
                        onChange={event => setGoalGrade(key, event.target.value)}
                        type='number'
                        className={classes.numberField}
                      />
                    )
                }
                {
                  <div style={{ margin: 'auto', display: 'inline' }}>
                    {` / ${a.outOf}`}
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
