import React from 'react'
import { renderToString } from 'react-dom/server'
import createToolTip from '../util/createToolTip'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

export const AssignmentPlanningTooltip = classes => createToolTip(d => renderToString(
  <Paper className={classes.paper}>
    <Typography>
      Assignment: <strong>{d.name}</strong><br />
      Due at: <strong>{d.due_dates}</strong><br />
      Your grade: <strong>{d.score ? `${d.score}` : 'Not available'}</strong><br />
      Total points possible: <strong>{d.points_possible}</strong><br />
      Avg assignment grade: <strong>{d.avg_score}</strong><br />
      Percentage worth in final grade: <strong>{d.towards_final_grade}%</strong><br />
    </Typography>
    {
      parseInt(d.drop_lowest) !== 0
        ? <Typography component='p'>
          The lowest <strong>{d.drop_lowest}</strong> scores will dropped from this assigment group
        </Typography>
        : ''
    }
    {
      parseInt(d.drop_highest) !== 0
        ? <Typography component='p'>
          The highest <strong>{d.drop_highest}</strong> scores will dropped from this assigment group
        </Typography>
        : ''
    }
  </Paper>
))
