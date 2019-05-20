import React, { useEffect, useState, useRef } from 'react'
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
import Cookie from 'js-cookie'

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

const getCurrentWeek = assignmentData => {
  assignmentData.forEach(item => {
    let weekStatus = item.due_date_items[0].assignment_items[0].current_week
    if (weekStatus) {
      return item.week
    }
  })
}

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
}

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

function AssignmentPlanning (props) {
  const { classes, courseInfo, match } = props
  const currentSetting = 'My current setting'
  const rememberSetting = 'Remember my setting'
  const settingNotUpdated = 'Setting not updated'
  const currentCourseId = match.params.courseId
  // initial default value that we get from backend and updated value when user save the default setting
  const [defaultValue, setDefaultValue] = useState('')
  // assignment data and weight controller
  const [assignmentFilter, setAssignmentFilter] = useState('')
  const [assignmentData, setAssignmentData] = useState('')
  const [activeAssignmentView, setActiveAssignmentView] = useState(false)

  // defaults setting controllers
  const [defaultCheckboxState, setDefaultCheckedState] = useState(true)
  const [defaultLabel, setDefaultLabel] = useState(currentSetting)

  const changeDefaultSetting = (event) => {
    const didUserChecked = event.target.checked

    setDefaultCheckedState(didUserChecked)
    setDefaultLabel(didUserChecked ? currentSetting : rememberSetting)

    if (didUserChecked) {
      // Django rejects PUT/DELETE/POST calls with out CSRF token.
      const csrfToken = Cookie.get('csrftoken')
      const body = { assignment: assignmentFilter }
      const dataURL = `http://localhost:5001/api/v1/courses/${currentCourseId}/set_user_default_selection`

      defaultFetchOptions.headers['X-CSRFToken'] = csrfToken
      defaultFetchOptions['method'] = 'PUT'
      defaultFetchOptions['body'] = JSON.stringify(body)

      fetch(dataURL, defaultFetchOptions)
        .then(res => res.json())
        .then(data => {
          const res = data.default
          if (res === 'success') {
            setDefaultValue(assignmentFilter)
            setDefaultCheckedState(true)
            return
          }
          setDefaultLabel(settingNotUpdated)
        })
    }
  }

  const onChangeAssignmentList = event => {
    const value = event.target.value
    setAssignmentFilter(value)
    if (defaultValue === value) {
      setDefaultCheckedState(true)
      setDefaultLabel(currentSetting)
    } else {
      setDefaultCheckedState(false)
      setDefaultLabel(rememberSetting)
    }

  }
  const firstUpdate = useRef(true)

  useEffect(() => {
      if (courseInfo) {
        const ap = courseInfo.course_view_options.ap
        const viewEnabled = ap === 1 ? true : false

        if (viewEnabled) {
          const fetchOptions = { method: 'get', ...defaultFetchOptions }
          const dataURL = `http://localhost:5001/api/v1/courses/${currentCourseId}/get_user_default_selection?default_type=assignment`
          fetch(dataURL, fetchOptions)
            .then(res => res.json())
            .then(data => {
              if (data.default === '') {
                setAssignmentFilter(0)
                setDefaultValue(0)

              } else {
                setAssignmentFilter(data.default)
                setDefaultValue(parseInt(data.default))
              }
              setActiveAssignmentView(viewEnabled)

            })
        }
      }
    }, [courseInfo]
  )
  // https://stackoverflow.com/questions/53253940/make-react-useeffect-hook-not-run-on-initial-render
  // getting the assignment content call needs to happen after the defaults otherwise 2 data fetches happen
     useEffect(() => {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }
      const fetchOptions = { method: 'get', ...defaultFetchOptions }
      const dataURL = `http://localhost:5001/api/v1/courses/${currentCourseId}/assignments?percent=${assignmentFilter}`
      fetch(dataURL, fetchOptions)
        .then(res => res.json())
        .then(data => {
          setAssignmentData(data)
        })
    }, [assignmentFilter]
  )
  if (!activeAssignmentView) {
    return (
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <p>Assignment View is hidden for this course</p>
        </Paper>
      </Grid>
    )
  }
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <>
              <Typography variant='h5' gutterBottom>Progress toward Final Grades the </Typography>
              {assignmentData ? <ProgressBar
                data={assignmentData.progress}
                aspectRatio={0.12}
                tip={createToolTip(d => renderToString(
                  <Paper className={classes.paper}>
                    <Typography>
                      Assignment: <strong>{d.name}</strong><br/>
                      Due at: <strong>{d.due_dates}</strong><br/>
                      Your grade: <strong>{d.score ? `${d.score}` : 'Not available'}</strong><br/>
                      Total points possible: <strong>{d.points_possible}</strong><br/>
                      Avg assignment grade: <strong>{d.avg_score}</strong><br/>
                      Percentage worth in final grade: <strong>{d.towards_final_grade}%</strong><br/>
                    </Typography>
                    {parseInt(d.drop_lowest) !== 0 ?
                      <Typography component="p">
                        The lowest <strong>{d.drop_lowest}</strong> scores will dropped from this assigment group
                      </Typography> : ''
                    }
                    {parseInt(d.drop_highest) !== 0 ?
                      <Typography component="p">
                        The highest <strong>{d.drop_highest}</strong> scores will dropped from this assigment group
                      </Typography> : ''}
                  </Paper>
                ))}/> : <Spinner/>}
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
                <div className={classes.graded}/>
                <Typography style={{ display: 'inline' }}> Graded</Typography>
                <br/>
                <div className={classes.ungraded}/>
                <Typography style={{ display: 'inline' }}> Not Yet Graded</Typography>
                <br/>
              </Grid>
            </Grid>
            <FormControl>
              <Typography>Show assignments that weigh at least</Typography>
              <div style={{ display: 'flex' }}>
                <Select
                  value={assignmentFilter}
                  onChange={onChangeAssignmentList}>
                  <MenuItem value={0}>0% (all)</MenuItem>
                  <MenuItem value={2}>2%</MenuItem>
                  <MenuItem value={5}>5%</MenuItem>
                  <MenuItem value={10}>10%</MenuItem>
                  <MenuItem value={20}>20%</MenuItem>
                  <MenuItem value={50}>50%</MenuItem>
                  <MenuItem value={75}>75%</MenuItem>
                </Select>
                {defaultCheckboxState ? <div style={{ padding: '10px' }}></div> : <Checkbox
                  checked={defaultCheckboxState}
                  onChange={changeDefaultSetting}
                  value="checked"
                />}
                <div style={{ padding: '15px 2px' }}>{defaultLabel}</div>
              </div>
            </FormControl>
            {/*in case of no data empty list is sent*/}
            {assignmentData ? assignmentTable(assignmentData.plan) : <Spinner/>}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(AssignmentPlanning)
