import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
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
    lineHeight: '1.42857143',
    padding: '12px 8px',
    verticalAlign: 'middle'
  },
  tableResponsive: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  }
})

function WhatIfGrade(props) {
  const { classes } = props

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom>What If Grade Calculator</Typography>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  {[
                    'Assignment Name',
                    'Actual Grade',
                    '"What-If" Grade'].map((prop, key) => {
                      return (
                        <TableCell
                          className={classes.tableCell + ' ' + classes.tableHeadCell}
                          key={key}
                        >
                          {prop}
                        </TableCell>
                      )
                    })}
                </TableRow>
              </TableHead>
              <TableBody>

              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(WhatIfGrade)
