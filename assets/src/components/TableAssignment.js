// modified from https://demos.creative-tim.com/material-dashboard-react/?_ga=2.12819711.913135977.1549993496-494583875.1549993496#/table

import React, { useRef, useEffect } from 'react'
import RootRef from '@material-ui/core/RootRef'
import withStyles from '@material-ui/core/styles/withStyles'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import HorizontalBar from '../components/HorizontalBar'
import createToolTip from '../util/createToolTip'
import { renderToString } from 'react-dom/server'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const tableStyle = theme => ({
  table: {
    marginBottom: '0',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'transparent',
    borderSpacing: '0',
    borderCollapse: 'collapse'
  },
  tableHeadCell: {
    color: 'inherit',
    fontSize: '1em',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff'
  },
  tableCell: {
    lineHeight: '1.42857143',
    padding: '12px 8px',
    verticalAlign: 'middle'
  },
  tableResponsive: {
    width: '70%',
    height: 400,
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  }
})

const generateAssignmentTable = plan => {
  const tableArray = plan.reduce((acc, weekItem) => {
    const week = `Week ${weekItem.week}`
    const dueDateItems = weekItem.due_date_items

    dueDateItems.forEach(dueDateItem => {
      const dueDate = dueDateItem.due_date
      const assignmentItems = dueDateItem.assignment_items

      assignmentItems.forEach(assignment => {
        const assignmentName = assignment.name
        const percentOfFinalGrade = assignment.towards_final_grade
        const graded = assignment.graded
        const pointsPossible = assignment.points_possible
        const score = assignment.score
        const barData = { percentOfFinalGrade, graded, pointsPossible, score }
        acc.push([week, dueDate, assignmentName, barData])
      })
    })
    return acc
  }, [])
  return tableArray
}

function CustomAssignmentTable (props) {
  const { classes, tableHead, tableData, currentWeek = null } = props
  const currentWeekRow = useRef(null)
  const tableRef = useRef(null)
  const toolTipContent = (data) => {
    // if assignment is no points eg. reading as part of the course work
    if (data.pointsPossible === 0) {
      return 'No Points'
    }
    // student assignment is not graded, hence score will be null
    if (data.score === null) {
      return `NA/${data.pointsPossible}`
    }
    return `${data.score}/${data.pointsPossible}`
  }

  const data = generateAssignmentTable(tableData)
    .map(row => {
      const { percentOfFinalGrade, graded, pointsPossible, score } = row.pop()
      row.push(<HorizontalBar
        data={[{ label: 'grade', data: percentOfFinalGrade, graded, pointsPossible, score }]}
        width={200}
        height={20}
        tip={createToolTip(d =>
          renderToString(
            <Paper className={classes.paper}>
              <Typography component="p">Score: {toolTipContent(d)}</Typography>
            </Paper>
          ))}
      />)
      return row
    })

  const tableRow = (row, i) => (
    <TableRow key={i}>
      {
        row.map((prop, j) => {
          let displayProp = true
          let displayBorder = true
          let isCurrentWeek = false
          if (data[i - 1]) {
            // first item in the row the logic handles display of week property
            if (j === 0 && data[i][0] === data[i - 1][0]) {
              displayProp = false
            }
            // second item in the row the logic handles display of Due date property
            if (j === 1 && data[i][1] === data[i - 1][1]) {
              displayProp = false
            }
          }
          if (data[i + 1]) {
            if (j === 0 && data[i][0] === data[i + 1][0]) {
              displayBorder = false
            }

            if (j === 1 && data[i][1] === data[i + 1][1]) {
              displayBorder = false
            }
          }
          if (j === 0 && data[i][0] === `Week ${currentWeek}`) {
            isCurrentWeek = true
          }
          let borderAndCurrentWeekStyle = {}
          if (!displayBorder) {
            borderAndCurrentWeekStyle['borderBottom'] = 'none'
          }
          if (isCurrentWeek) {
            borderAndCurrentWeekStyle['color'] = 'orange'
          }
          return (
            <TableCell className={classes.tableCell} key={j} style={borderAndCurrentWeekStyle}>
              {displayProp ? prop : null}
            </TableCell>
          )
        })
      }
    </TableRow>
  )

  useEffect(() => {
    if (currentWeekRow.current) {
      const tableHeaderOffset = 50
      tableRef.current.parentNode.scrollTo({
        top: currentWeekRow.current.offsetTop - tableHeaderOffset,
        behavior: 'smooth'
      })
    }
  })

  const isItFirstCurrentWeekIndicator = i => {
    let firstIndicatorOfCurrentWeek = data[i][0] === `Week ${currentWeek}`
    if (firstIndicatorOfCurrentWeek && data[i - 1] && data[i][0] === data[i - 1][0]) {
      firstIndicatorOfCurrentWeek = false
    }
    return firstIndicatorOfCurrentWeek
  }

  return (
    <div className={classes.tableResponsive}>
      <RootRef rootRef={tableRef}>
        <Table ref={tableRef}>
          {tableHead !== undefined ? (
            <TableHead>
              <TableRow>
                {tableHead.map((prop, key) => {
                  return (
                    <TableCell
                      className={classes.tableCell + ' ' + classes.tableHeadCell}
                      key={key}>
                      {prop}
                    </TableCell>)
                })}
              </TableRow>
            </TableHead>
          ) : null}
          <TableBody>
            {
              data.map((row, i) => {
                return isItFirstCurrentWeekIndicator(i)
                  ? <RootRef rootRef={currentWeekRow} key={i}>{tableRow(row, i)}</RootRef>
                  : tableRow(row, i)
              })}
          </TableBody>
        </Table>
      </RootRef>
    </div>
  )
}

export default withStyles(tableStyle)(CustomAssignmentTable)
