import React, { useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import MTable from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'

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

function AssignmentTable (props) {
  const { classes, assignments } = props

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
            )
            )
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
                {/* insert horizontal bar component */}
              </TableCell>
              <TableCell>
                {
                  assignment.graded
                    ? `${assignment.score} / ${assignment.outOf}`
                    : `box for grades / ${assignment.outOf}`
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
