import React from 'react'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from './Spinner'
import emojiEndpoints from '../constants/emojiEndpoints'

const createTableCard = (TableComponent, EmojiFeedback) => props => {
  const {
    classes,
    feedbackId,
    tableHead,
    tableData,
    xs = 12,
    sm = 6,
    md = 4
  } = props

  return (
    <Grid item xs={xs} sm={sm} md={md}>
      <Paper className={classes.paper}>
        {props.children}
        <Grid item xs={12}>
          {tableData
            ? <TableComponent tableHead={tableHead} tableData={tableData} />
            : <Spinner />
          }
        </Grid>
        {EmojiFeedback !== undefined && tableData
          ? <EmojiFeedback id={feedbackId} popoverText={'give feedback'} endpoints={emojiEndpoints} />
          : null}
      </Paper>
    </Grid>
  )
}

export default createTableCard
