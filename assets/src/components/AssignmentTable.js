import React, { useEffect, useRef, useState } from 'react'
import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import Input from '@mui/material/Input'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MTable from '@mui/material/Table'
import Popover from '@mui/material/Popover'
import Select from '@mui/material/Select'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import GradedIcon from '@mui/icons-material/Done'
import UnsubmittedIcon from '@mui/icons-material/Remove'
import SubmittedIcon from '@mui/icons-material/Textsms'
import ProgressBarV2 from './ProgressBarV2'
import PopupMessage from './PopupMessage'
import StyledTextField from './StyledTextField'
import AlertBanner from '../components/AlertBanner'
import usePopoverEl from '../hooks/usePopoverEl'
import { calculateWeekOffset } from '../util/date'
import { roundToXDecimals, getDecimalPlaceOfFloat } from '../util/math'
import { assignmentStatus } from '../util/assignment'

const PREFIX = 'AssignmentTable'

const classes = {
  root: `${PREFIX}-root`,
  messageWrapper: `${PREFIX}-messageWrapper`,
  container: `${PREFIX}-container`,
  sliderCell: `${PREFIX}-sliderCell`,
  goalGradeInput: `${PREFIX}-goalGradeInput`,
  tableCell: `${PREFIX}-tableCell`,
  tableHeadCell: `${PREFIX}-tableHeadCell`,
  popover: `${PREFIX}-popover`,
  narrowCell: `${PREFIX}-narrowCell`,
  veryNarrowCell: `${PREFIX}-veryNarrowCell`,
  possiblePointsText: `${PREFIX}-possiblePointsText`,
  formControl: `${PREFIX}-formControl`,
  filterArea: `${PREFIX}-filterArea`,
  graded: `${PREFIX}-graded`,
  ungraded: `${PREFIX}-ungraded`,
  unsubmitted: `${PREFIX}-unsubmitted`,
  assignmentName: `${PREFIX}-assignmentName`,
  filterButton: `${PREFIX}-filterButton`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
    padding: 8
  },

  [`& .${classes.container}`]: {
    maxHeight: 500
  },

  [`& .${classes.sliderCell}`]: {
    minWidth: '150px'
  },

  [`& .${classes.goalGradeInput}`]: {
    marginTop: 0,
    width: 100,
    marginBottom: '10px'
  },

  [`& .${classes.tableCell}`]: {
    border: 'none'
  },

  [`& .${classes.tableHeadCell}`]: {
    fontSize: '1em',
    height: headerHeight + 'px'
  },

  [`& .${classes.popover}`]: {
    pointerEvents: 'none'
  },

  [`& .${classes.narrowCell}`]: {
    width: '120px'
  },

  [`& .${classes.veryNarrowCell}`]: {
    width: '60px'
  },

  [`& .${classes.possiblePointsText}`]: {
    margin: 'auto',
    display: 'inline-block',
    paddingTop: '22px',
    paddingLeft: '5px',
    verticalAlign: 'middle'
  },

  [`& .${classes.formControl}`]: {
    margin: theme.spacing(1),
    width: '95%'
  },

  [`& .${classes.filterArea}`]: {
    alignItems: 'center',
    marginBottom: '2px',
    backgroundColor: '#F4F4F4'
  },

  [`& .${classes.graded}`]: {
    color: theme.palette.secondary.main
  },

  [`& .${classes.ungraded}`]: {
    color: theme.palette.info.main
  },

  [`& .${classes.unsubmitted}`]: {
    color: theme.palette.negative.main
  },

  [`& .${classes.assignmentName}`]: {
    whiteSpace: 'nowrap '
  },

  [`& .${classes.filterButton}`]: {
    textTransform: 'none'
  }
}))

// separate styles for child of opened popover
const StyledPopoverMessage = styled('div')(({ theme }) => ({
  [`& .${classes.messageWrapper}`]: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  }
}))

const headerHeight = 105

function AssignmentTable (props) {
  const {
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

  const [popoverEl, setPopoverEl, clearPopoverEl] = usePopoverEl()

  const [assignmentGroupNames, setAssignmentGroupNames] = useState([])

  const [assignmentNameFilter, setAssignmentNameFilter] = useState('')

  const [assignmentGroupFilterArray, setAssignmentGroupFilterArray] = useState([])

  const [assignmentStatusFilterArray, setAssignmentStatusFilterArray] = useState([])

  const [filtersAreClear, setFiltersAreClear] = useState(true)

  const [previousWeek, setPreviousWeek] = useState()

  const weeksPresent = useRef([])
  const shouldScrollToCurrentWeek = useRef(false)

  const tableRef = useRef(null)
  const previousWeekRow = useRef(null)

  const currentDate = new Date()
  const currentWeek = calculateWeekOffset(dateStart, currentDate)
  // const previousWeek = currentWeek - 1

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
    ? getDecimalPlaceOfFloat(pointsPossible)
    : 1

  // this effect scrolls to current week of assignments if it exists
  useEffect(() => {
    if (!shouldScrollToCurrentWeek.current && previousWeekRow.current) {
      const tableHeaderOffset = 35 // And the universe said 'Let the offset be 35'
      tableRef.current.scrollTo({
        top: previousWeekRow.current.offsetTop - tableHeaderOffset,
        behavior: 'smooth'
      })
      shouldScrollToCurrentWeek.current = true
    }
  }, [previousWeekRow.current, filteredAssignments])

  useEffect(() => {
    const allGroupNames = assignments.map(ag => ag.assignmentGroup.name)
    const uniqueGroupNames = [...new Set(allGroupNames)].sort()
    setAssignmentGroupNames(uniqueGroupNames)
  }, [assignments])

  useEffect(() => {
    const allWeeks = [...new Set(assignments.map(a => a.week))].sort((a, b) => { return a - b })
    if (allWeeks.length > 0) {
      weeksPresent.current = allWeeks
      const firstItem = weeksPresent.current.indexOf(0) === -1 ? weeksPresent.current.indexOf(1) : weeksPresent.current.indexOf(0)
      const indexOfCurrentWeek = weeksPresent.current.indexOf(currentWeek)
      if (indexOfCurrentWeek > 0 && firstItem !== indexOfCurrentWeek) {
        setPreviousWeek(weeksPresent.current[indexOfCurrentWeek - 1])
      }
    }
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
  const TRUNCATED_ASSIGNMENT_NAME_LENGTH = 50
  const shortenString = (text, len) => {
    return (text.length > len)
      ? text.substring(0, len - 3) + '...'
      : text
  }

  const clearFilters = () => {
    setAssignmentGroupFilterArray([])
    setAssignmentNameFilter('')
    setAssignmentStatusFilterArray([])
  }

  return (
    <Root>
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
      <TableContainer className={classes.container} ref={tableRef}>
        <MTable stickyHeader>
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
                  <TableRow key={key} {...(a.week === previousWeek ? { ref: previousWeekRow } : {})}>
                    <TableCell
                      style={{
                        ...(isNextWeekTheSame(a.week, key) ? { borderBottom: 'none' } : {}),
                        ...(a.week === currentWeek ? { color: 'orange' } : {})
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
                        ...(isNextDayTheSame(a.dueDateMonthDay, key) ? { borderBottom: 'none' } : {})
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
                    <TableCell style={{ width: '15%' }}>
                      <Tooltip title={a.assignmentGroup.name} placement='top' enterDelay={500}>
                        <div>{shortenString(a.assignmentGroup.name, TRUNCATED_GROUP_NAME_LENGTH)}</div>
                      </Tooltip>
                    </TableCell>
                    <TableCell style={{ width: '25%' }}>
                      <Tooltip title={a.name} placement='top-start' enterDelay={500}>
                        <div className={classes.assignmentName}>{shortenString(a.name, TRUNCATED_ASSIGNMENT_NAME_LENGTH)}</div>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={classes.narrowCell}>
                      {`${roundToXDecimals(a.percentOfFinalGrade, 1)}%`}
                    </TableCell>
                    <TableCell style={{ minWidth: '200px' }}>
                      <>
                        {
                          a.graded || a.outOf === 0
                            ? <div className={classes.possiblePointsText}>{a.outOf === 0 ? '0' : `${a.currentUserSubmission.score}`}</div>
                            : (
                              <StyledTextField
                                error={(a.goalGrade / a.pointsPossible) > 1}
                                disabled={!courseGoalGradeSet}
                                id={`goal-grade-${key}`}
                                value={roundToXDecimals(a.goalGrade, placeToRoundTo(a.pointsPossible))}
                                label={
                                  !courseGoalGradeSet
                                    ? 'Set a goal'
                                    : (a.goalGrade / a.pointsPossible) > 1
                                        ? 'Over 100%'
                                        : 'Set a goal'
                                }
                                onChange={event => {
                                  const assignmentGoalGrade = event.target.value
                                  handleAssignmentGoalGrade(a.id, assignmentGoalGrade, a.goalGrade)
                                }}
                                type='number'
                                className={classes.goalGradeInput}
                                onFocus={() => handleInputFocus(a.id)}
                                onBlur={() => handleInputBlur(a.id)}
                              />
                              )
                        }
                        <div className={classes.possiblePointsText}>
                          {` / ${a.outOf}`}
                        </div>
                        <div
                          onMouseEnter={event => setPopoverEl(key, event.currentTarget)}
                          onMouseLeave={clearPopoverEl}
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
                            onBarFocus={el => setPopoverEl(key, el)}
                            onBarBlur={clearPopoverEl}
                          />
                          <Popover
                            className={classes.popover}
                            anchorEl={popoverEl.anchorEl}
                            open={popoverEl.popoverId === key}
                            sx={{
                              pointerEvents: 'none'
                            }}
                            onClose={clearPopoverEl}
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left'
                            }}
                            transformOrigin={{
                              vertical: 'bottom',
                              horizontal: 'left'
                            }}
                            disableRestoreFocus
                            disableAutoFocus
                            disableEnforceFocus
                          >
                            <StyledPopoverMessage>
                              <div className={classes.messageWrapper}>
                                <PopupMessage a={a} assignmentGroups={assignmentGroups} />
                              </div>
                            </StyledPopoverMessage>
                          </Popover>
                        </div>
                      </>
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
                        inputProps={{
                          'aria-label': 'Lock Goal'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </MTable>
      </TableContainer>
      {assignments.length > 0 && filteredAssignments.length === 0 && <AlertBanner>No assignments match your filter selections.</AlertBanner>}
    </Root>
  )
}

export default (AssignmentTable)
