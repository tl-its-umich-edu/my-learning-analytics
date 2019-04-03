// modified from https://demos.creative-tim.com/material-dashboard-react/?_ga=2.12819711.913135977.1549993496-494583875.1549993496#/table

import React from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import HorizontalBar from '../components/HorizontalBar'

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
        const barData = { percentOfFinalGrade, graded }
        acc.push([week, dueDate, assignmentName, barData])
      })
    })
    return acc
  }, [])
  return tableArray
}

const getCurrentWeek = data => {
  let weekIndicator = ''
  data.forEach(item => {
    let week = item.week
    let currentWeek = item.due_date_items[0].assignment_items[0].current_week
    if (currentWeek) {
      weekIndicator = `Week ${week}`
    }
  })
  return weekIndicator
}

function CustomAssignmentTable (props) {
  const { classes, tableHead, tableData } = props
  const data = generateAssignmentTable(tableData)
    .map(row => {
      const { percentOfFinalGrade, graded } = row.pop()
      row.push(<HorizontalBar
        data={[{ label: 'grade', data: percentOfFinalGrade, graded }]}
        width={200}
        height={20}
      />)
      return row
    })
  const currentWeek = getCurrentWeek(tableData)
  return (
    <div className={classes.tableResponsive}>
      <Table>
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
          {data.map((row, i) => {
            return (
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
                    if (j === 0 && data[i][0] === currentWeek) {
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
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default withStyles(tableStyle)(CustomAssignmentTable)
