import React from 'react'
import { renderToString } from 'react-dom/server'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { tip as d3tip } from 'd3-v6-tip'

export const AssignmentPlanningTooltip = classes => d3tip().html((event, d) => {
  return renderToString(
  <Paper className={classes.paper}>
    <Typography>
      Assignment: <strong>{d.name}</strong><br />
      Due: <strong>{d.due_dates}</strong><br />
      Your grade: <strong>{d.score ? `${d.score}` : 'Not available'}</strong><br />
      Total points possible: <strong>{d.points_possible}</strong><br />
      Avg. assignment grade: <strong>{d.avg_score}</strong><br />
      Percentage of final grade: <strong>{d.towards_final_grade}%</strong><br />
      <strong>{d.submitted_at ? 'You have submitted the assignment.' : 'You have NOT submitted the assignment yet.'}</strong>
    </Typography>
    {
      parseInt(d.drop_lowest) !== 0
        ? (
          <Typography component='p'>
          The lowest <strong>{d.drop_lowest}</strong> scores will dropped from this assigment group
          </Typography>
        ) : ''
    }
    {
      parseInt(d.drop_highest) !== 0
        ? (
          <Typography component='p'>
          The highest <strong>{d.drop_highest}</strong> scores will dropped from this assigment group
          </Typography>
        ) : ''
    }
  </Paper>
)})
