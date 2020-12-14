import React, { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
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
import GradedIcon from '@material-ui/icons/Done'
import UnsubmittedIcon from '@material-ui/icons/Remove'
import SubmittedIcon from '@material-ui/icons/Textsms'
import ProgressBarV2 from './ProgressBarV2'
import PopupMessage from './PopupMessage'
import ConditionalWrapper from './ConditionalWrapper'
import StyledTextField from './StyledTextField'
import AlertBanner from '../components/AlertBanner'
import { calculateWeekOffset } from '../util/date'
import { roundToXDecimals, getDecimalPlaceOfFloat } from '../util/math'
import { assignmentStatus } from '../util/assignment'

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
  },
  graded: {
    color: theme.palette.secondary.main
  },
  ungraded: {
    color: theme.palette.info.main
  },
  unsubmitted: {
    color: theme.palette.negative.main
  },
  filterButton: {
    textTransform: 'none'
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

  const assignmentStatusNames = Object.values(assignmentStatus)

  /*
    filteredAssignments is a local copy of assignments that reflects the
    current state of the various AssignmentTable filters.
  */
  const [filteredAssignments, setFilteredAssignments] = useState(assignments)

  const [popoverEl, setPopoverEl] = useState({ popoverId: null, anchorEl: null })

  const [assignmentGroupNames, setAssignmentGroupNames] = useState([])

  const [assignmentNameFilter, setAssignmentNameFilter] = useState('')

  const [assignmentGroupFilterArray, setAssignmentGroupFilterArray] = useState([])

  const [assignmentStatusFilterArray, setAssignmentStatusFilterArray] = useState([])

  const [filtersAreClear, setFiltersAreClear] = useState(true)

  const tableRef = useRef(null)
  const currentWeekRow = useRef(null)

  const currentDate = new Date()
  const currentWeek = calculateWeekOffset(dateStart, currentDate)

  const maxPercentOfFinalGrade = Math.max(
    ...assignments.map(({ percentOfFinalGrade }) => percentOfFinalGrade)
  )

  const isNextWeekTheSame = (week, key) => {
    return filteredAssignments[key + 1]
      ? filteredAssignments[key + 1].week === week
      : false
  }

  const isPreviousWeekTheSame = (week, key) => {
    return key >= 1
      ? filteredAssignments[key - 1].week === week
      : false
  }

  const isNextDayTheSame = (dueDateMonthDay, key) => {
    return filteredAssignments[key + 1]
      ? filteredAssignments[key + 1].dueDateMonthDay === dueDateMonthDay
      : false
  }
  const isPreviousDayTheSame = (dueDateMonthDay, key) => {
    return key >= 1
      ? filteredAssignments[key - 1].dueDateMonthDay === dueDateMonthDay
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

  useEffect(() => {
    setFiltersAreClear(assignmentNameFilter.trim().length === 0 && assignmentStatusFilterArray.length === 0 && assignmentGroupFilterArray.length === 0)
  }, [assignmentNameFilter, assignmentStatusFilterArray, assignmentGroupFilterArray])

  const matchesNameFilter = (assignment, nameFilter) => {
    return nameFilter.trim().length === 0 || assignment.name.toUpperCase().includes(nameFilter.toUpperCase())
  }

  const matchesAssignmentStatusFilter = (assignment, statusArray) => {
    return statusArray.length === 0 || (statusArray.indexOf(assignmentStatus.GRADED) >= 0 && assignment.graded) || (statusArray.indexOf(assignmentStatus.SUBMITTED) >= 0 && assignment.submitted && !assignment.graded) || (statusArray.indexOf(assignmentStatus.UNSUBMITTED) >= 0 && !(assignment.graded || assignment.submitted))
  }

  const matchesAssignmentGroupFilter = (assignment, groupArray) => {
    return groupArray.length === 0 || groupArray.indexOf(assignment.assignmentGroup.name) >= 0
  }

  // Update filteredAssignments when any of the filters change
  useEffect(() => {
    setFilteredAssignments(
      assignments
        .filter(assignment => matchesNameFilter(assignment, assignmentNameFilter))
        .filter(assignment => matchesAssignmentStatusFilter(assignment, assignmentStatusFilterArray))
        .filter(assignment => matchesAssignmentGroupFilter(assignment, assignmentGroupFilterArray))
    )
  }, [assignments, assignmentNameFilter, assignmentStatusFilterArray, assignmentGroupFilterArray])

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

  const clearFilters = () => {
    setAssignmentGroupFilterArray([])
    setAssignmentNameFilter('')
    setAssignmentStatusFilterArray([])
  }

  return (
    <div>
      <Grid container className={classes.filterArea}>
        <Grid item xs={12} sm={4}>
          <FormControl className={classes.formControl}>
            <InputLabel>Filter by Type</InputLabel>
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
        <Grid item xs={12} sm={3}>
          <FormControl className={classes.formControl}>
            <InputLabel>Filter by Name</InputLabel>
            <Input value={assignmentNameFilter} placeholder='Filter by name...' onChange={e => setAssignmentNameFilter(e.target.value)} />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl className={classes.formControl}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              labelId='assignment-status-checkbox-label'
              id='assignment-status-mutiple-checkbox'
              multiple
              value={assignmentStatusFilterArray}
              onChange={e => setAssignmentStatusFilterArray(e.target.value)}
              input={<Input />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
              width='250px'
            >
              {assignmentStatusNames.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={assignmentStatusFilterArray.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Tooltip title='Clear filters' placement='bottom' enterDelay={500}>
            <FormControl className={classes.formControl}>
              <Button size='small' variant='contained' onClick={() => clearFilters()} disabled={filtersAreClear} className={classes.filterButton}>Clear Filters</Button>
            </FormControl>
          </Tooltip>
        </Grid>
      </Grid>
      <RootRef rootRef={tableRef}>
        <TableContainer className={classes.container}>
          <MTable stickyHeader ref={tableRef}>
            <TableHead>
              <TableRow>
                {
                  [
                    'Week',
                    'Due',
                    'Type',
                    'Name',
                    'Percent of Final Grade',
                    'Score / Out of',
                    'Status',
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
                filteredAssignments
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
                                    handleAssignmentGoalGrade(a.id, assignmentGoalGrade)
                                  }}
                                  type='number'
                                  className={classes.goalGradeInput}
                                  onFocus={() => handleInputFocus(a.id)}
                                  onBlur={() => handleInputBlur(a.id)}
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
                              submitted={a.currentUserSubmission ? a.currentUserSubmission.submittedAt : ''}
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
                          <Tooltip title={a.graded ? assignmentStatus.GRADED : a.submitted ? assignmentStatus.SUBMITTED : assignmentStatus.UNSUBMITTED}>
                            {a.graded ? <GradedIcon className={classes.graded} /> : a.submitted ? <SubmittedIcon className={classes.ungraded} /> : <UnsubmittedIcon className={classes.unsubmitted} />}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            disabled={a.graded || !courseGoalGradeSet}
                            checked={!!a.goalGradeSetByUser}
                            onChange={event => handleAssignmentLock(a.id, event.target.checked)}
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
        {assignments.length > 0 && filteredAssignments.length === 0 &&
          <AlertBanner>No assignments match your filter selections.</AlertBanner>}
      </RootRef>
    </div>
  )
}

export default withStyles(styles)(AssignmentTable)
