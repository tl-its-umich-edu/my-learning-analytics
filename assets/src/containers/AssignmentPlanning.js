import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { renderToString } from 'react-dom/server'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Table from '../components/Table'
import ProgressBar from '../components/ProgressBar'
import HorizontalBar from '../components/HorizontalBar'
import createToolTip from '../util/createToolTip'
import { useAssignmentPlanningData } from '../service/api'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  graded: {
    width: '10px',
    height: '10px',
    background: 'lightskyblue',
    display: 'inline-block'
  },
  ungraded: {
    width: '10px',
    height: '10px',
    background: 'gray',
    display: 'inline-block'
  }
})

function AssignmentPlanning(props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId
  const [assignmentFilter, setAssignmentFilter] = useState(0)
  const [loaded, assignmentData] = useAssignmentPlanningData(currentCourseId, assignmentFilter)

  const generateAssignmentTable = plan => {
    const tableArray = plan.reduce((acc, weekItem) => {
      const week = weekItem.week
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

  const AssignmentTable = plan => (
    <Table
      tableHead={['Week', 'Due', 'Title', 'Percent of final grade']}
      tableData={generateAssignmentTable(plan)
        .map(row => {
          const { percentOfFinalGrade, graded } = row.pop()
          row.push(<HorizontalBar
            data={[{ label: 'grade', data: percentOfFinalGrade, graded }]}
            width={200}
            height={20}
          />)
          return row
        })
      }
    />
  )

  const tableBuilder = (assignmentData) => {
    if (!assignmentData || Object.keys(assignmentData).length === 0) {
      return (<p>No data provided</p>)
    }
    return AssignmentTable(assignmentData)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <>
              <Typography variant='h5' gutterBottom>Progress toward Final Grade</Typography >
              {assignmentData ? <ProgressBar
                data={assignmentData.progress}
                aspectRatio={0.12}
                tip={createToolTip(d => renderToString(
                  <Paper className={classes.paper}>
                    <Table tableData={[
                      ['Assignment', <strong>{d.name}</strong>],
                      ['Due at', <strong>{d.due_dates}</strong>],
                      ['Your grade', <strong>{d.score ? `${d.score}` : 'Not available'}</strong>],
                      ['Total points possible', <strong>{d.points_possible}</strong>],
                      ['Avg assignment grade', <strong>{d.avg_score}</strong>],
                      ['Percentage worth in final grade', <strong>{d.towards_final_grade}%</strong>]
                    ]} />
                  </Paper>
                ))} /> : <Spinner />}
            </ >
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container>
              <Grid item xs={12} md={10}>
                <Typography variant='h5' gutterBottom >Assignments Due by Date</Typography >
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant='h6'>Assignment Status</Typography>
                <div className={classes.graded} />
                <Typography style={{ display: 'inline' }}> Graded</Typography>
                <br />
                <div className={classes.ungraded} />
                <Typography style={{ display: 'inline' }}> Not Yet graded</Typography>
                <br />
              </Grid>
            </Grid>
            <FormControl>
              <Typography>Show assignments that weigh at least</Typography>
              <Select
                value={assignmentFilter}
                onChange={event => setAssignmentFilter(event.target.value)}>
                <MenuItem value={0}>0% (all)</MenuItem>
                <MenuItem value={2}>2%</MenuItem>
                <MenuItem value={5}>5%</MenuItem>
                <MenuItem value={10}>10%</MenuItem>
                <MenuItem value={20}>20%</MenuItem>
                <MenuItem value={50}>50%</MenuItem>
                <MenuItem value={75}>75%</MenuItem>
              </Select>
            </FormControl>
            {loaded ? tableBuilder(assignmentData.plan) : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanning)
