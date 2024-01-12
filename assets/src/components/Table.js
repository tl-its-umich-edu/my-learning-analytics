// modified from https://demos.creative-tim.com/material-dashboard-react/?_ga=2.12819711.913135977.1549993496-494583875.1549993496#/table

import React from 'react'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'

const PREFIX = 'Table'

const classes = {
  table: `${PREFIX}-table`,
  tableHeadCell: `${PREFIX}-tableHeadCell`,
  tableCell: `${PREFIX}-tableCell`,
  tableResponsive: `${PREFIX}-tableResponsive`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.table}`]: {
    marginBottom: '0',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'transparent',
    borderSpacing: '0',
    borderCollapse: 'collapse'
  },

  [`& .${classes.tableHeadCell}`]: {
    color: 'inherit',
    fontSize: '1em'
  },

  [`& .${classes.tableCell}`]: {
    lineHeight: '1.42857143',
    padding: '12px 8px',
    verticalAlign: 'middle'
  },

  [`&.${classes.tableResponsive}`]: {
    width: '100%',
    overflowX: 'auto'
  }
}))

function CustomTable (props) {
  const { tableHead, tableData, noBorder } = props
  return (
    <Root className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined
          ? (
            <TableHead>
              <TableRow>
                {tableHead.map((prop, key) => {
                  return (
                    <TableCell
                      className={classes.tableCell + ' ' + classes.tableHeadCell}
                      key={key}
                      style={noBorder ? { borderBottom: 'none' } : null}
                    >
                      {prop}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableHead>
            )
          : null}
        <TableBody>
          {tableData.map((prop, key) => {
            return (
              <TableRow key={key}>
                {prop.map((prop, key) => {
                  return (
                    <TableCell
                      className={classes.tableCell}
                      key={key}
                      style={noBorder ? { borderBottom: 'none' } : null}
                    >
                      {prop}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Root>
  )
}

export default (CustomTable)
