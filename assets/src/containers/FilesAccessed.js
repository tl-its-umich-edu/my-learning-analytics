import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import Checkbox from '@material-ui/core/Checkbox'
import RangeSlider from '../components/RangeSlider'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useUserSettingData } from '../service/api'
import { handleError, defaultFetchOptions } from '../util/data'
import FileAccessChart from '../components/FileAccessChart'
import Cookie from 'js-cookie'
import Error from './Error'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.secondary
  },
  formController: {
    display: 'flex',
    marginTop: theme.spacing.unit * 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBox: {
    marginLeft: 20,
  },
})

const currentSetting = 'My current setting'
const rememberSetting = 'Remember my setting'
const settingNotUpdated = 'Setting not updated'

function FilesAccessed (props) {
  const { classes, courseInfo, courseId } = props
  const resource_values = RESOURCE_VALUES 
  if (!courseInfo.course_view_options.fa) return (<Error>Files view is hidden for this course.</Error>)
  const [loaded, error, filesDefaultData] = useUserSettingData(courseId, 'file') // Used to update default setting
  const [minMaxWeek, setMinMaxWeek] = useState([]) // Should be updated from info
  const [curWeek, setCurWeek] = useState(0) // Should be updated from info
  const [weekRange, setWeekRange] = useState([]) // Should be depend on curWeek
  const [gradeRangeFilter, setGradeRangeFilter] = useState('') // Should be fetched from default
  const [resourceFilter, setResourceFilter] = useState([])
  const [fileAccessData, setFileAccessData] = useState('')
  const [dataControllerLoad, setDataControllerLoad] = useState(0)
  // initial default value that we get from backend and updated value when user save the default setting
  const [defaultValue, setDefaultValue] = useState('')

  // defaults setting controllers
  const [defaultCheckboxState, setDefaultCheckedState] = useState(true)
  const [defaultLabel, setDefaultLabel] = useState(currentSetting)

  function setDefaultFilterState() {
    let tempArray = []
    resource_values.forEach(function(resource_item) {
      if (resource_item.disabled === "false") {
        tempArray.push(resource_item.resource_value)
      }
    })
    return tempArray
  }

  const changeDefaultSetting = (event) => {
    const didUserChecked = event.target.checked

    setDefaultCheckedState(didUserChecked)
    setDefaultLabel(didUserChecked ? currentSetting : rememberSetting)

    if (didUserChecked) {
      // Django rejects PUT/DELETE/POST calls with out CSRF token.
      const csrfToken = Cookie.get('csrftoken')
      const body = { file: gradeRangeFilter }
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
      if (filesDefaultData.default !== '') {
        setGradeRangeFilter(filesDefaultData.default)
        setResourceFilter(resourceFilter.concat(setDefaultFilterState()))
        setDefaultValue(filesDefaultData.default)
      } else {
        // setting it to default
        setGradeRangeFilter('All')
        setResourceFilter(resourceFilter.concat(setDefaultFilterState()))
        setDefaultValue('All')
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [loaded])

  useEffect(() => {
    // Fetch data once all the setting data is fetched
    if (dataControllerLoad === 2 && resourceFilter != "") {
      const dataURL = `/api/v1/courses/${courseId}/file_access_within_week?week_num_start=${weekRange[0]}&week_num_end=${weekRange[1]}&grade=${gradeRangeFilter}&resource_type=${resourceFilter}`
      const fetchOptions = { method: 'get', ...defaultFetchOptions }
      fetch(dataURL, fetchOptions)
        .then(handleError)
        .then(res => res.json())
        .then(data => {
          setFileAccessData(data)
        })
        .catch(err => {
          setFileAccessData({})
        })
    }
    else {
      setFileAccessData({})
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

  const onChangeFileHandler = event => {
    const value = event.target.value
    if (event.target.checked == true && !resourceFilter.includes(value)) {
      setResourceFilter([...resourceFilter, value])
    } 
    else if (event.target.checked == false) { 
      setResourceFilter(resourceFilter.filter(val => {
        return val != value
      }))
    }
    
  }

  const FileAccessChartBuilder = (fileData) => {
    if (!fileData || Object.keys(fileData).length === 0) {
      if (resourceFilter == "") {
        return (<text>Please select a resource type to display data</text>)
      } 
      else {
        return (<p>No data provided</p>)
      }
    }
    return (
      <Grid item xs={12} lg={10}>
        <FileAccessChart
          data={fileData}
          aspectRatio={0.3}
        />
      </Grid>
    )
  }
  if (error) return (<Error>Something went wrong, please try again later.</Error>)
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
              <p>Resources accessed from
                week <b>{weekRange[0]} {weekRange[0] === curWeek ? ' (Now)' : ''}</b> to <b>{weekRange[1]}{weekRange[1] === curWeek ? ' (Now)' : ''}</b> with
                these grades: </p>
              <FormControl className={classes.formControl}>
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
            <div style={{ textAlign: "center" }}>
              <FormControl>
                <FormGroup row>
                  <p><b>Select Resources to be Viewed:</b></p>
                  {
                    resource_values.map((el, i) => (<FormControlLabel key={i} control={<Checkbox color='primary' defaultChecked={true} onChange={onChangeFileHandler} value={el.resource_value} disabled={el.disabled === "true"}></Checkbox>} label={el.resource_label}/>))
                  }
                </FormGroup>
              </FormControl>
            </div>
            {fileAccessData
              ? FileAccessChartBuilder(fileAccessData): <Spinner/>}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(FilesAccessed)
