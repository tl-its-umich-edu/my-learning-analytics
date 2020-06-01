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
import StyledTextField from './StyledTextField'
import { calculateWeekOffset } from '../util/date'
import { roundToXDecimals, getDecimalPlaceOfFloat } from '../util/math'

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
    width: 100,
    marginBottom: '10px'
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
  },
  possiblePointsText: {
    margin: 'auto',
    display: 'inline-block',
    paddingTop: '22px',
    paddingLeft: '5px',
    verticalAlign: 'middle'
  }
})

function AssignmentTable (props) {
  const {
    classes,
    courseGoalGradeSet,
    assignments,
    assignmentGroups,
    dateStart,
    handleAssignmentGoalGrade,
    handleAssignmentLock,
    handleInputFocus,
    handleInputBlur
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

  // Use decimal place of pointsPossible if it's a decimal; otherwise, round to nearest tenth
  const placeToRoundTo = pointsPossible => (String(pointsPossible).includes('.'))
    ? getDecimalPlaceOfFloat(pointsPossible) : 1

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
                      {`${roundToXDecimals(a.percentOfFinalGrade, 1)}%`}
                    </TableCell>
                    <TableCell style={{ width: '20%' }}>
                      {
                        a.graded || a.outOf === 0
                          ? <div className={classes.possiblePointsText}>{a.outOf === 0 ? '0' : `${a.currentUserSubmission.score}`}</div>
                          : (
                            <StyledTextField
                              error={(a.goalGrade / a.pointsPossible) > 1}
                              disabled={!courseGoalGradeSet}
                              id='standard-number'
                              value={roundToXDecimals(a.goalGrade, placeToRoundTo(a.pointsPossible))}
                              label={
                                !courseGoalGradeSet ? 'Set a goal'
                                  : (a.goalGrade / a.pointsPossible) > 1
                                    ? 'Over 100%'
                                    : 'Set a goal'
                              }
                              onChange={event => {
                                const assignmentGoalGrade = event.target.value
                                handleAssignmentGoalGrade(key, assignmentGoalGrade)
                              }}
                              type='number'
                              className={classes.goalGradeInput}
                              onFocus={() => handleInputFocus(key)}
                              onBlur={() => handleInputBlur(key)}
                            />
                          )
                      }
                      {
                        <div className={classes.possiblePointsText}>
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
                        disabled={a.graded || !courseGoalGradeSet}
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
