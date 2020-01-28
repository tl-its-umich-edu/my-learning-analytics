import React, { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TableContainer from '@material-ui/core/TableContainer'
import RootRef from '@material-ui/core/RootRef'
import MTable from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import Checkbox from '@material-ui/core/Checkbox'
import Popover from '@material-ui/core/Popover'
import ProgressBarV2 from './ProgressBarV2'
import PopupMessage from './PopupMessage'
import ConditionalWrapper from './ConditionalWrapper'
import { roundToOneDecimal } from '../util/math'
import StyledTextField from './StyledTextField'
import { calculateWeekOffset } from '../util/date'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  container: {
    maxHeight: 500
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
  tableHeadCell: {
    fontSize: '1em'
  },
  popover: {
    pointerEvents: 'none'
  },
  narrowCell: {
    width: '120px'
  }
})

function AssignmentTable (props) {
  const {
    classes,
    assignments,
    assignmentGroups,
    dateStart,
    handleAssignmentGoalGrade,
    handleAssignmentLock
  } = props

  const [popoverEl, setPopoverEl] = useState({ popoverId: null, anchorEl: null })

  const tableRef = useRef(null)
  const currentWeekRow = useRef(null)

  const currentDate = new Date()
  const currentWeek = calculateWeekOffset(dateStart, currentDate)

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

  const isNextDayTheSame = (dueDateMonthDay, key) => {
    return assignments[key + 1]
      ? assignments[key + 1].dueDateMonthDay === dueDateMonthDay
      : false
  }
  const isPreviousDayTheSame = (dueDateMonthDay, key) => {
    return key >= 1
      ? assignments[key - 1].dueDateMonthDay === dueDateMonthDay
      : false
  }

  // this effect scrolls to current week of assignments if it exists
  useEffect(() => {
    if (currentWeekRow.current) {
      const tableHeaderOffset = 120
      tableRef.current.scrollTo({
        top: currentWeekRow.current.offsetTop - tableHeaderOffset,
        behavior: 'smooth'
      })
    }
  }, [currentWeekRow.current])

  return (
    <RootRef rootRef={tableRef}>
      <TableContainer className={classes.container}>
        <MTable stickyHeader ref={tableRef}>
          <TableHead>
            <TableRow>
              {
                [
                  'Week',
                  'Due',
                  'Assignment Name',
                  'Percent of Final Grade',
                  'Score / Out of',
                  'Lock Goal'
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
                <ConditionalWrapper
                  condition={a.week === currentWeek}
                  wrapper={children => <RootRef rootRef={currentWeekRow} key={key}>{children}</RootRef>}
                  key={key}
                >
                  <TableRow key={key}>
                    <TableCell
                      style={{
                        ...isNextWeekTheSame(a.week, key)
                          ? { borderBottom: 'none' }
                          : {},
                        ...a.week === currentWeek
                          ? { color: 'orange' }
                          : {}
                      }}
                      className={classes.narrowCell}
                    >
                      {
                        a.week
                          ? isPreviousWeekTheSame(a.week, key)
                            ? ''
                            : `Week ${a.week}`
                          : 'No due date'
                      }
                    </TableCell>
                    <TableCell
                      style={{
                        ...isNextDayTheSame(a.dueDateMonthDay, key)
                          ? { borderBottom: 'none' }
                          : {}
                      }}
                      className={classes.narrowCell}
                    >
                      {
                        a.week
                          ? isPreviousDayTheSame(a.dueDateMonthDay, key)
                            ? ''
                            : a.dueDateMonthDay
                          : ''
                      }
                    </TableCell>
                    <TableCell style={{ width: '30%' }}>
                      {a.name}
                    </TableCell>
                    <TableCell className={classes.narrowCell}>
                      {`${roundToOneDecimal(a.percentOfFinalGrade)}%`}
                    </TableCell>
                    <TableCell style={{ width: '20%' }}>
                      {
                        a.graded || a.outOf === 0
                          ? a.outOf === 0
                            ? '0'
                            : `${a.currentUserSubmission.score}`
                          : (
                            <StyledTextField
                              error={(a.goalGrade / a.pointsPossible) > 1}
                              id='standard-number'
                              value={roundToOneDecimal(a.goalGrade)}
                              label={
                                (a.goalGrade / a.pointsPossible) > 1
                                  ? 'Over 100%'
                                  : 'Set a goal'
                              }
                              onChange={event => {
                                // if user clears assignment goal, unlock goal
                                if (event.target.value === '') {
                                  handleAssignmentLock(key, false)
                                }
                                handleAssignmentGoalGrade(key, event.target.value)
                              }}
                              type='number'
                              className={classes.goalGradeInput}
                              style={{ marginBottom: '10px' }}
                            />
                          )

                      }
                      {
                        <div style={{ margin: 'auto', display: 'inline' }}>
                          {` / ${a.outOf}`}
                        </div>
                      }
                      <div
                        onMouseEnter={event => setPopoverEl({ popoverId: key, anchorEl: event.currentTarget })}
                        onMouseLeave={() => setPopoverEl({ popoverId: null, anchorEl: null })}
                      >
                        <ProgressBarV2
                          score={a.currentUserSubmission ? a.currentUserSubmission.score : 0}
                          outOf={a.outOf}
                          goalGrade={a.goalGrade}
                          percentWidth={a.percentOfFinalGrade / maxPercentOfFinalGrade * 70}
                          displayLabel
                          lines={
                            a.goalGrade !== ''
                              ? [{ color: 'green', value: a.goalGrade, draggable: true }]
                              : []
                          }
                        />
                        <Popover
                          className={classes.popover}
                          classes={{ paper: classes.paper }}
                          anchorEl={popoverEl.anchorEl}
                          open={popoverEl.popoverId === key}
                          onClose={() => setPopoverEl({ popoverId: null, anchorEl: null })}
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
                          <PopupMessage a={a} assignmentGroups={assignmentGroups} />
                        </Popover>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        disabled={a.graded}
                        checked={!!a.goalGradeSetByUser}
                        onChange={event => handleAssignmentLock(key, event.target.checked)}
                        color='primary'
                      />
                    </TableCell>
                  </TableRow>
                </ConditionalWrapper>
              ))
            }
          </TableBody>
        </MTable>
      </TableContainer>
    </RootRef>
  )
}

export default withStyles(styles)(AssignmentTable)
