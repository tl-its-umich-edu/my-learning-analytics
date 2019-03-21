import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Table from '../components/Table'
import HorizontalBar from '../components/HorizontalBar'
import { useAssignmentPlanningData } from '../service/api'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  }
})

function AssignmentPlanning (props) {
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
          acc.push([week, dueDate, assignmentName, percentOfFinalGrade])
        })
      })
      return acc
    }, [])
    return tableArray
  }

  const AssignmentTable = plan => (
    <Table className={classes.table}
      tableHead={['Week', 'Due', 'Title', 'Percent of final grade']}
      tableData={generateAssignmentTable(plan)
        .map(row => {
          const percentOfFinalGrade = row.pop()
          row.push(<HorizontalBar
            data={[{ label: 'grade', data: percentOfFinalGrade }]}
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
    return AssignmentTable(assignmentData.plan)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >Assignment Planning</Typography >
            <>
              <FormControl className={classes.formControl}>
                <InputLabel>Courses</InputLabel>
                <Select
                  value={assignmentFilter}
                  onChange={event => setAssignmentFilter(event.target.value)}
                >
                  <MenuItem value={0}>0% (all)</MenuItem>
                  <MenuItem value={2}>2%</MenuItem>
                  <MenuItem value={5}>5%</MenuItem>
                  <MenuItem value={10}>10%</MenuItem>
                  <MenuItem value={20}>20%</MenuItem>
                  <MenuItem value={50}>50%</MenuItem>
                  <MenuItem value={75}>75%</MenuItem>
                </Select>
              </FormControl>
              {loaded ? tableBuilder(assignmentData) : <Spinner />}
            </>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanning)
