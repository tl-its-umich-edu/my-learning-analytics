import React, { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import MTable from '@material-ui/core/Table'
import Popover from '@material-ui/core/Popover'
import RootRef from '@material-ui/core/RootRef'
import Select from '@material-ui/core/Select'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import DoneIcon from '@material-ui/icons/Done'
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
  veryNarrowCell: {
    width: '60px'
  },
  possiblePointsText: {
    margin: 'auto',
    display: 'inline-block',
    paddingTop: '22px',
    paddingLeft: '5px',
    verticalAlign: 'middle'
  },
  formControl: {
    margin: theme.spacing(1),
    width: '95%'
  },
  filterArea: {
    alignItems: 'center',
    marginBottom: '2px',
    backgroundColor: '#F4F4F4'
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

  const [gradedOnly, setGradedOnly] = useState(false)

  const [assignmentGroupNames, setAssignmentGroupNames] = useState([])

  const [assignmentFilter, setAssignmentFilter] = useState('')

  const [assignmentGroupFilterArray, setAssignmentGroupFilterArray] = useState([])

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

  useEffect(() => {
    const allGroupNames = assignments.map(ag => ag.assignmentGroup.name)
    const uniqueGroupNames = [...new Set(allGroupNames)].sort()
    setAssignmentGroupNames(uniqueGroupNames)
  }, [assignments])

  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    }
  }

  const TRUNCATED_GROUP_NAME_LENGTH = 30
  const shortenString = text => {
    return (text.length > TRUNCATED_GROUP_NAME_LENGTH)
      ? text.substring(0, TRUNCATED_GROUP_NAME_LENGTH - 3) + '...'
      : text
  }

  return (
    <RootRef rootRef={tableRef}>
      <div>
        <Grid container className={classes.filterArea}>
          <Grid item xs={12} sm={5}>
            <FormControl className={classes.formControl}>
              <InputLabel>Filter by Assignment Group</InputLabel>
              <Select
                labelId='assignment-group-checkbox-label'
                id='assignment-group-mutiple-checkbox'
                multiple
                value={assignmentGroupFilterArray}
                onChange={e => setAssignmentGroupFilterArray(e.target.value)}
                input={<Input />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
                width='250px'
              >
                {assignmentGroupNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={assignmentGroupFilterArray.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControl className={classes.formControl}>
              <InputLabel>Filter by Assignment Name</InputLabel>
              <Input value={assignmentFilter} placeholder='Filter by assignment name...' onChange={e => setAssignmentFilter(e.target.value)} />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={1}>
            <FormControlLabel
              className={classes.formControl}
              control={
                <Checkbox
                  checked={gradedOnly}
                  onChange={() => setGradedOnly(!gradedOnly)}
                  name='checkedB'
                  color='primary'
                />
              }
              label='Graded'
            />
          </Grid>
        </Grid>
        <TableContainer className={classes.container}>
          <MTable stickyHeader ref={tableRef}>
            <TableHead>
              <TableRow>
                {
                  [
                    'Week',
                    'Due',
                    'Assignment Group',
                    'Assignment Name',
                    'Percent of Final Grade',
                    'Score / Out of',
                    'Graded',
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
                assignments
                  .filter(assignment => assignmentFilter.trim().length === 0 || assignment.name.toUpperCase().includes(assignmentFilter.toUpperCase()))
                  .filter(assignment => !gradedOnly || assignment.graded)
                  .filter(assignment => assignmentGroupFilterArray.length === 0 || assignmentGroupFilterArray.indexOf(assignment.assignmentGroup.name) >= 0)
                  .map((a, key) => (
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
                        <TableCell style={{ width: '20%' }}>
                          <Tooltip title={a.assignmentGroup.name} placement='top' enterDelay={500}>
                            <div>{shortenString(a.assignmentGroup.name)}</div>
                          </Tooltip>
                        </TableCell>
                        <TableCell style={{ width: '20%' }}>
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
                              description={`This assignment is worth ${a.percentOfFinalGrade}% of your grade.  
                              Points possible: ${a.pointsPossible}.
                              Your goal: ${(a.goalGrade ? a.goalGrade : 'None')}.  
                              Your grade: ${(a.grade ? a.grade : 'Not graded')}.  
                              Class average: ${a.averageGrade}.  
                              Rules: ${(a.rules ? a.rules : 'There are no rules for this assignment')}.  `}
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
                        <TableCell className={classes.veryNarrowCell}>
                          {a.graded ? <DoneIcon /> : <div />}
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
      </div>
    </RootRef>
  )
}

export default withStyles(styles)(AssignmentTable)
