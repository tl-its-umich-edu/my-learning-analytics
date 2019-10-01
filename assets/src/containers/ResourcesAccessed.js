import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'
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
import { useResourceData } from '../service/api'
import { isObjectEmpty } from '../util/object'
import Cookie from 'js-cookie'
import AlertBanner from '../components/AlertBanner'
import WarningBanner from '../components/WarningBanner'
import RangeSlider from '../components/RangeSlider'
import ResourceAccessChart from '../components/ResourceAccessChart'
import Spinner from '../components/Spinner'
import { type } from 'os'

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
  const [userSettingLoaded, error, userSetting] = useUserSettingData(courseId, 'resource') // Used to update default setting
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


  const [showSaveSetting, setShowSaveSetting] = useState(false)
  const [saveSettingClicked, setSaveSettingClicked] = useState(false)
  
  // this is the filter setting last saved by the user
  const [userSavedFilterSetting, setUserSavedFilterSetting] = useState(gradeRangeFilter)
  const [resourceLoaded, recourseError, resourceData] = useResourceData(courseId, weekRange, gradeRangeFilter, resourceFilter, !userSettingLoaded)
  const [saveLabel, setSaveLabel] = useState(currentSetting)

  const [userSettingSaved, savingError, userSettingResponse] = useSetUserSetting(
    courseId,
    { resource: gradeRangeFilter },
    userSavedFilterSetting !== gradeRangeFilter && saveSettingClicked, // only save if the filter setting last saved does not equal the current grade filter, and checkbox is checked.
    [saveSettingClicked]
  )

  useEffect(() => {
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setGradeRangeFilter('All')
      } else {
        setGradeRangeFilter(userSetting.default)
        setUserSavedFilterSetting(userSetting.default)
      }
    }
  }, [userSettingLoaded])

  useEffect(() => {
    // if user setting is different from current grade filter, show label for remembering setting
    if (userSavedFilterSetting !== gradeRangeFilter) {
      setSaveLabel(rememberSetting)
    } else if (savingError) {
      setSaveLabel(settingNotUpdated)
    } else {
      setSaveLabel(currentSetting)
    }
  })

  // if user setting is saved, don't show checkbox and sync userSavedFilterSetting with gradeRangeFilter
  useEffect(() => {
    if (userSettingSaved) {
      setShowSaveSetting(false)
      setUserSavedFilterSetting(gradeRangeFilter)
    }
  }, [userSettingSaved])

  const handleResourceGradeFilter = event => {
    const value = event.target.value
    setGradeRangeFilter(value)

    if (userSavedFilterSetting !== value) {
      setSaveSettingClicked(false)
      setShowSaveSetting(true)
    } else {
      setShowSaveSetting(false)
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




  const onWeekChangeHandler = value => {
    // Update week range slider
    setWeekRange(value)
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
                  onChange={handleResourceGradeFilter}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="90-100">90-100%</MenuItem>
                  <MenuItem value="80-89">80-89%</MenuItem>
                  <MenuItem value="70-79">70-79%</MenuItem>
                </Select>
              </FormControl>
              {showSaveSetting
                ? <Checkbox
                  checked={saveSettingClicked}
                  onChange={() => setSaveSettingClicked(!saveSettingClicked)}
                  value='checked'
                  color='primary'
                />
                : null
              }
              <div style={{ padding: '15px 2px' }}>{saveLabel}</div>
            </div>
            {
              filterCheckbox()
            }
            { /* in case of no data empty list is sent */}
            {resourceLoaded ? ResourceAccessChartBuilder(resourceData)
              : <Spinner/>}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(ResourcesAccessed)
