import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useUserSettingData } from '../service/api'
import { handleError, defaultFetchOptions } from '../util/data'
import Cookie from 'js-cookie'
import AlertBanner from '../components/AlertBanner'
import WarningBanner from '../components/WarningBanner'
import RangeSlider from '../components/RangeSlider'
import ResourceAccessChart from '../components/ResourceAccessChart'
import Spinner from '../components/Spinner'

import { type } from 'os';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    color: theme.palette.text.secondary,
    padding: theme.spacing.unit * 2
  },
  formController: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing.unit * 2,
  },
  controlText: {
    paddingLeft: 8,
    paddingRight: 8
  },
  checkBox: {
    marginLeft: 20
  },
})

const currentSetting = 'My current setting'
const rememberSetting = 'Remember my setting'
const settingNotUpdated = 'Setting not updated'

function ResourcesAccessed (props) {
  const { classes, courseInfo, courseId, disabled } = props
  if (disabled) return (<AlertBanner>The Resources Accessed view is hidden for this course.</AlertBanner>)
  let resourceTypes = courseInfo.resource_types
  if (resourceTypes.length === 0) {
    resourceTypes = ['Files']
  }
  const [loaded, error, resourcesDefaultData] = useUserSettingData(courseId, 'resource') // Used to update default setting
  const [minMaxWeek, setMinMaxWeek] = useState([]) // Should be updated from info
  const [curWeek, setCurWeek] = useState(0) // Should be updated from info
  const [weekRange, setWeekRange] = useState([]) // Should be depend on curWeek
  const [gradeRangeFilter, setGradeRangeFilter] = useState('') // Should be fetched from default
  const [resourceFilter, setResourceFilter] = useState(resourceTypes)
  const [resourceAccessData, setResourceAccessData] = useState('')
  const [dataControllerLoad, setDataControllerLoad] = useState(0)
  // initial default value that we get from backend and updated value when user save the default setting
  const [defaultValue, setDefaultValue] = useState('')

  // defaults setting controllers
  const [defaultCheckboxState, setDefaultCheckedState] = useState(true)
  const [defaultLabel, setDefaultLabel] = useState(currentSetting)

  const [dataLoaded, setDataLoaded] = useState(false)

  function filterCheckbox() {
    if (resourceAccessData) {
      if (resourceTypes.length > 1) {
        return(
          <div style={{ textAlign: "center" }}>
            <FormControl>
              <FormGroup row>
                <p className={classes.controlText}>Select resource types to be viewed:</p>
                {
                  resourceTypes.map((el, i) => (<FormControlLabel key={i} control={<Checkbox color='primary' defaultChecked={true} onChange={onChangeResourceHandler} value={el}></Checkbox>} label={el}/>))
                }
              </FormGroup>
            </FormControl>
          </div>
        )
      }
      else if (resourceTypes.length === 1) {
        let message = "You are viewing " + resourceTypes[0] + " data"
        return(
          <div style={{ textAlign: "center" }}>
            <p style={{fontWeight: "bold"}}>{message}</p>
          </div>
        )
      }
    }
  }

  const changeDefaultSetting = (event) => {
    const didUserChecked = event.target.checked

    setDefaultCheckedState(didUserChecked)
    setDefaultLabel(didUserChecked ? currentSetting : rememberSetting)

    if (didUserChecked) {
      // Django rejects PUT/DELETE/POST calls with out CSRF token.
      const csrfToken = Cookie.get('csrftoken')
      const body = { resource: gradeRangeFilter }
      const dataURL = `/api/v1/courses/${courseId}/set_user_default_selection`

      defaultFetchOptions.headers['X-CSRFToken'] = csrfToken
      defaultFetchOptions['method'] = 'PUT'
      defaultFetchOptions['body'] = JSON.stringify(body)

      fetch(dataURL, defaultFetchOptions)
        .then(handleError)
        .then(res => res.json())
        .then(data => {
          const res = data.default
          if (res === 'success') {
            setGradeRangeFilter(gradeRangeFilter)
            setDefaultCheckedState(true)
            setDefaultValue(gradeRangeFilter)
            return
          }
          setDefaultLabel(settingNotUpdated)
        }).catch(err => {
        setDefaultLabel(settingNotUpdated)
      })
    }
  }

  useEffect(() => {
    // Fetch info data and update slider length, slider range, and current week
    if (courseInfo) {
      const totalWeeks = courseInfo.total_weeks
      const currentWeek = courseInfo.current_week_number

      setMinMaxWeek([1, totalWeeks])
      if (currentWeek > totalWeeks) {
        setWeekRange([1, totalWeeks])
      } else if (currentWeek < 3) {
        setCurWeek(currentWeek)
        setWeekRange([1, currentWeek])
      } else {
        setCurWeek(currentWeek)
        setWeekRange([currentWeek - 2, currentWeek])
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [courseInfo])

  useEffect(() => {
    // Fetch grade range from default setting if any
    if (loaded) {
      if (resourcesDefaultData.default !== '') {
        setGradeRangeFilter(resourcesDefaultData.default)
        setDefaultValue(resourcesDefaultData.default)
      } else {
        // setting it to default
        setGradeRangeFilter('All')
        setDefaultValue('All')
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [loaded])

  useEffect(() => {
    // Fetch data once all the setting data is fetched
    if (dataControllerLoad === 2 && !(resourceFilter.length === 0)) {
      const dataURL = `/api/v1/courses/${courseId}/resource_access_within_week?week_num_start=${weekRange[0]}&week_num_end=${weekRange[1]}&grade=${gradeRangeFilter}&resource_type=${resourceFilter}`
      const fetchOptions = { method: 'get', ...defaultFetchOptions }
      fetch(dataURL, fetchOptions)
        .then(handleError)
        .then(res => res.json())
        .then(data => {
          setResourceAccessData(data)
          setDataLoaded(true)
        })
        .catch(err => {
          setResourceAccessData({})
        })
    }
    else {
      setResourceAccessData({})
    }
  }, [dataControllerLoad, weekRange, gradeRangeFilter, resourceFilter])

  const onWeekChangeHandler = value => {
    // Update week range slider
    setWeekRange(value)
  }

  const onChangeGradeRangeHandler = event => {
    // Update grade range selection
    const value = event.target.value
    setGradeRangeFilter(value)
    if (defaultValue === value) {
      setDefaultCheckedState(true)
      setDefaultLabel(currentSetting)
    } else {
      setDefaultCheckedState(false)
      setDefaultLabel(rememberSetting)
    }
  }

  const onChangeResourceHandler = event => {
    setDataLoaded(false)
    const value = event.target.value
    if (event.target.checked && !resourceFilter.includes(value)) {
      setResourceFilter([...resourceFilter, value])
    } 
    else if (!event.target.checked) { 
      setResourceFilter(resourceFilter.filter(val => val !== value))
    }
  }

  const ResourceAccessChartBuilder = (resourceData) => {
    if (resourceFilter.length === 0) {
      return (<AlertBanner>Please select a resource type to display data.</AlertBanner>)
    }
    else if (!resourceData || Object.keys(resourceData).length === 0) {
      return (<AlertBanner>Resource data for your selections is not available.</AlertBanner>)
    }
    else {
      return (
        <Grid item xs={12} lg={10}>
          <ResourceAccessChart
            data={resourceData}
            aspectRatio={0.3}
          />
        </Grid>
      )
    }
  }
  if (error) return (<WarningBanner/>)
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom className="title">Resources Accessed</Typography>
            {dataControllerLoad == 2 ? <RangeSlider
              curWeek={curWeek}
              className="slider"
              startWeek={weekRange[0]}
              endWeek={weekRange[1]}
              min={minMaxWeek[0]}
              max={minMaxWeek[1]}
              onWeekChange={onWeekChangeHandler}
            /> : ''}
            <div className={classes.formController}>
              <p className={classes.controlText}>Resources accessed from week <b>{weekRange[0]} {weekRange[0] === curWeek ? ' (Now)' : ''}</b> to <b>{weekRange[1]}{weekRange[1] === curWeek ? ' (Now) ' : ''}</b> by students with these grades:</p>
              <FormControl>
                <Select
                  value={gradeRangeFilter}
                  onChange={onChangeGradeRangeHandler}
                  inputProps={{
                    name: 'grade',
                    id: 'grade-range',
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="90-100">90-100%</MenuItem>
                  <MenuItem value="80-89">80-89%</MenuItem>
                  <MenuItem value="70-79">70-79%</MenuItem>
                </Select>
              </FormControl>
              {defaultCheckboxState ? <div style={{ padding: '10px' }}></div> : <Checkbox
                checked={defaultCheckboxState}
                onChange={changeDefaultSetting}
                value="checked"
              />}
              <div style={{ padding: '15px 2px' }}>{defaultLabel}</div>
            </div>
            {
              filterCheckbox()
            }
            {(resourceAccessData && dataLoaded) || resourceFilter.length === 0
              ? ResourceAccessChartBuilder(resourceAccessData)
              : <Spinner/>}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(ResourcesAccessed)
