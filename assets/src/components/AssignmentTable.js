import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import MTable from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TextField from '@material-ui/core/TextField'
import ProgressBarV2 from './ProgressBarV2'
import Popover from '@material-ui/core/Popover'
import { roundToOneDecimal } from '../util/math'
import { Typography } from '@material-ui/core'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  sliderCell: {
    minWidth: '150px'
  },
  goalGradeInput: {
    marginTop: 0,
    width: 85
  },
  tableCell: {
    border: 'none'
  },
  popover: {
    pointerEvents: 'none'
  }
})

function AssignmentTable (props) {
  const { classes, assignments, setGoalGrade } = props

  const [anchorEl, setAnchorEl] = useState(null)

  const maxPercentOfFinalGrade = Math.max(
    ...assignments.map(({ percentOfFinalGrade }) => percentOfFinalGrade)
  )

  const isNextWeekTheSame = (week, key) => {
    return assignments[key + 1]
      ? assignments[key + 1].week === week
      : false
  }

  const isPreviousWeekTheSame = (week, key) => {
    return key >= 1
      ? assignments[key - 1].week === week
      : false
  }

  return (
    <MTable>
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
              <TableCell
                style={
                  isNextWeekTheSame(a.week, key)
                    ? { borderBottom: 'none' }
                    : {}
                }
              >
                {
                  a.week
                    ? isPreviousWeekTheSame(a.week, key)
                      ? ''
                      : `Week ${a.week}`
                    : ''
                }
              </TableCell>
              <TableCell
                style={
                  isNextWeekTheSame(a.week, key)
                    ? { borderBottom: 'none' }
                    : {}
                }
              >
                {
                  a.week
                    ? isPreviousWeekTheSame(a.week, key)
                      ? ''
                      : a.dueDateMonthDay
                    : ''
                }
              </TableCell>
              <TableCell>
                {a.name}
              </TableCell>
              <TableCell>
                <div
                  onMouseEnter={event => setAnchorEl(event.currentTarget)}
                  onMouseLeave={() => setAnchorEl(null)}
                >
                  <ProgressBarV2
                    score={a.currentUserSubmission ? a.currentUserSubmission.score : 0}
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
                </div>
                <div style={{ marginLeft: '2px' }}>{`${a.percentOfFinalGrade}%`}</div>
                <Popover
                  className={classes.popover}
                  classes={{
                    paper: classes.paper
                  }}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  disableRestoreFocus
                >
                  <Typography>Put something in here...</Typography>
                </Popover>
              </TableCell>
              <TableCell>
                {
                  a.graded || a.outOf === 0
                    ? a.outOf === 0
                      ? '0'
                      : `${a.currentUserSubmission.score}`

                    : (
                      <TextField
                        error={(a.goalGrade / a.pointsPossible) > 1}
                        id='standard-number'
                        value={roundToOneDecimal(a.goalGrade) || ''}
                        label={
                          (a.goalGrade / a.pointsPossible) > 1
                            ? 'Over 100%'
                            : 'Set a goal'
                        }
                        onChange={event => setGoalGrade(key, event.target.value)}
                        type='number'
                        className={classes.goalGradeInput}
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
