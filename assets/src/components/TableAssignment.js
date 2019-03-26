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
    fontSize: '1em'
  },
  tableCell: {
    verticalAlign: 'top',
    paddingBottom: '0px'
  },
  tableResponsive: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  }

})

function CustomAssignmentTable(props) {
  const {classes, tableHead, tableData} = props


  return (
    <div className={classes.tableResponsive}>
      <Table>
        {tableHead !== undefined ? (
          <TableHead>
            <TableRow>
              {tableHead.map((prop, key) => {
                return (<TableCell className={classes.tableCell + ' ' + classes.tableHeadCell}
                                   key={key}>{prop}</TableCell>)
              })}
            </TableRow>
          </TableHead>
        ) : null}</Table>
      <Table><TableBody>
        {
          tableData.map((week, key) => {
            return (
              <TableRow key={key}>
                <TableCell className={classes.tableCell}
                           key={key + 'week'}>Week {week.week}</TableCell>
                <TableCell className={classes.tableCell} key={key + 'weekRest'}>
                  <Table><TableBody>{
                    week.due_date_items.map((due_dates, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell className={classes.tableCell}
                                     key={key + 'dueDates'}>{due_dates.due_date}</TableCell>
                          <TableCell className={classes.tableCell}
                                     key={key + 'assignInfo'}>
                            <Table><TableBody>{
                              due_dates.assignment_items.map((assignments, key) => {
                                return (
                                  <TableRow key={key}>
                                    <TableCell className={classes.tableCell}
                                               key={key + 'assignName'}>{assignments.name}</TableCell>
                                    <TableCell className={classes.tableCell}
                                               key={key + 'grade'}>
                                      <HorizontalBar data={[{
                                        label: 'grade',
                                        data: assignments.towards_final_grade
                                      }]} width={200} height={20}/>
                                    </TableCell>
                                  </TableRow>
                                )

                              })

                            }
                            </TableBody></Table>
                          </TableCell>


                        </TableRow>
                      )
                    })
                  }
                  </TableBody></Table>


                </TableCell>
              </TableRow>
            )
          })
        }
      </TableBody>
      </Table>

    </div>
  )
}

export default withStyles(tableStyle)(CustomAssignmentTable)
