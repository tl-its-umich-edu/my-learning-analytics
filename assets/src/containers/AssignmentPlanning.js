import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { renderToString } from 'react-dom/server'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Spinner from '../components/Spinner'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import ProgressBar from '../components/ProgressBar'
import createToolTip from '../util/createToolTip'
import TableAssignment from '../components/TableAssignment'
import Checkbox from '@material-ui/core/Checkbox'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import Error from './Error'
import { getCurrentWeek } from '../util/data'
import { useAssignmentData } from '../service/api'
import { isObjectEmpty } from '../util/object'
import useUserSetting from '../hooks/useUserSetting'
import useSetUserSetting from '../hooks/useSetUserSetting'

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

const assignmentTable = assignmentData => {
  if (!assignmentData || Object.keys(assignmentData).length === 0) {
    return (<Typography>No data provided</Typography>)
  }
  return <TableAssignment
    tableHead={['Week', 'Due', 'Title', 'Percent of final grade']}
    tableData={assignmentData}
    currentWeek={getCurrentWeek(assignmentData)}
  />
}

function AssignmentPlanning(props) {
  const { classes, disabled, courseId } = props
  if (disabled) return (<Error>Assignment view is hidden for this course.</Error>)

  const [showSaveSettingCheckbox, setShowSaveSettingCheckbox] = useState(false)
  const [saveSettingCheckbox, setSaveSettingCheckbox] = useState(false)
  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'assignment', [saveSettingCheckbox])
  const [assignmentGradeFilter, setAssignmentGradeFilter] = useState(0)
  const [assignmentLoaded, assignmentError, assignmentData] = useAssignmentData(courseId, assignmentGradeFilter)

  useEffect(() => {
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setAssignmentGradeFilter(0)
      } else {
        setAssignmentGradeFilter(userSetting.default)
      }
    }
  }, [userSettingLoaded])

  // console.log(saveSettingCheckbox)

  const [userSettingSaved, userSettingResponse] = useSetUserSetting(
    courseId,
    { assignment: assignmentGradeFilter },
    saveSettingCheckbox,
    [saveSettingCheckbox]
  )

  const handleAssignmentFilter = event => {
    const value = event.target.value
    if (assignmentGradeFilter !== value) {
      setAssignmentGradeFilter(value)
      setShowSaveSettingCheckbox(true)
    }
  }

  // if (error) return (<Error>Something went wrong, please try again later.</Error>)
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <>
              <Typography variant='h5' gutterBottom>Progress toward Final Grade</Typography>
              {assignmentData ? <ProgressBar
                data={assignmentData.progress}
                aspectRatio={0.12}
                tip={createToolTip(d => renderToString(
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
                ))} /> : <Spinner />}
            </ >
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container>
              <Grid item xs={12} md={10}>
                <Typography variant='h5' gutterBottom>Assignments Due by Date</Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant='h6'>Assignment Status</Typography>
                <div className={classes.graded} />
                <Typography style={{ display: 'inline' }}> Graded</Typography>
                <br />
                <div className={classes.ungraded} />
                <Typography style={{ display: 'inline' }}> Not Yet Graded</Typography>
                <br />
              </Grid>
            </Grid>
            <FormControl>
              <Typography>Show assignments that weigh at least</Typography>
              <div style={{ display: 'flex' }}>
                <Select
                  value={assignmentGradeFilter}
                  onChange={handleAssignmentFilter}
                >
                  <MenuItem value={0}>0% (all)</MenuItem>
                  <MenuItem value={2}>2%</MenuItem>
                  <MenuItem value={5}>5%</MenuItem>
                  <MenuItem value={10}>10%</MenuItem>
                  <MenuItem value={20}>20%</MenuItem>
                  <MenuItem value={50}>50%</MenuItem>
                  <MenuItem value={75}>75%</MenuItem>
                </Select>
                {showSaveSettingCheckbox
                  ? <>
                    <Checkbox
                      checked={saveSettingCheckbox}
                      onChange={() => setSaveSettingCheckbox(!saveSettingCheckbox)}
                      value='checked'
                    />
                    <div style={{ padding: '15px 2px' }}>Save Setting</div>
                  </>
                  : null}
              </div>
            </FormControl>
            <UserSettingSnackbar
              saved={userSettingSaved}
              response={userSettingResponse} />
            { /* in case of no data empty list is sent */}
            {assignmentData ? assignmentTable(assignmentData.plan) : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanning)
