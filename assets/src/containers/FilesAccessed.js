import React, { useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import Checkbox from '@material-ui/core/Checkbox'
import RangeSlider from '../components/RangeSlider'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { useCourseInfo, useUserSettingData } from '../service/api'
import FileAccessChart from '../components/FileAccessChart'
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

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
}

function FilesAccessed (props) {
  const { classes, courseId } = props
  const currentSetting = 'My current setting'
  const rememberSetting = 'Remember my setting'
  const settingNotUpdated = 'Setting not updated'
  const [minMaxWeek, setMinMaxWeek] = useState([]) // Should be updated from info
  const [curWeek, setCurWeek] = useState(0) // Should be updated from info
  const [weekRange, setWeekRange] = useState([]) // Should be depend on curWeek
  const [saveSettingState, setSaveSetting] = useState(false)
  const [gradeRange, setGradeRange] = useState('All') // Should be fetched from default
  const [infoLoaded, infoData] = useCourseInfo(courseId)
  const [settingLoaded, settingData] = useUserSettingData(courseId) // Used to update default setting
  const [fileAccessData, setFileAccessData] = useState([])
  const [fileAccessDataLoaded, setFileAccessDataLoaded] = useState(false)
  const [dataControllerLoad, setDataControllerLoad] = useState(0)
  // initial default value that we get from backend and updated value when user save the default setting
  const [defaultValue, setDefaultValue] = useState('')

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
      const body = { file: gradeRange }
      const dataURL = `http://localhost:5001/api/v1/courses/${currentCourseId}/set_user_default_selection`

      defaultFetchOptions.headers['X-CSRFToken'] = csrfToken
      defaultFetchOptions['method'] = 'PUT'
      defaultFetchOptions['body'] = JSON.stringify(body)

      fetch(dataURL, defaultFetchOptions)
        .then(res => res.json())
        .then(data => {
          const res = data.default
          if (res === 'success') {
            setGradeRange(gradeRange)
            setDefaultCheckedState(true)
            setDefaultValue(gradeRange)
            return
          }
          setDefaultLabel(settingNotUpdated)
        })
    }
  }

  useEffect(() => {
    // Fetch info data and update slider length, slider range, and current week
    if (infoLoaded) {
      setMinMaxWeek([1, infoData.total_weeks])
      if (infoData.current_week_number > infoData.total_weeks) {
        setWeekRange([1, infoData.total_weeks])
      } else if (infoData.current_week_number < 3) {
        setCurWeek(infoData.current_week_number)
        setWeekRange([1, infoData.current_week_number])
      } else {
        setCurWeek(infoData.current_week_number)
        setWeekRange([infoData.current_week_number - 2, infoData.current_week_number])
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [infoLoaded])

  useEffect(() => {
    // Fetch grade range from default setting if any
    if (settingLoaded) {
      if (settingData.default !== '') {
        setGradeRange(settingData.default)
        setDefaultValue(settingData.default)
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [settingLoaded])

  useEffect(() => {
    // Fetch data once all the setting data is fetched
    if (dataControllerLoad === 2) {
      const dataURL = `http://localhost:5001/api/v1/courses/${courseId}/file_access_within_week?week_num_start=${weekRange[0]}&week_num_end=${weekRange[1]}&grade=${gradeRange}`
      fetch(dataURL)
        .then(res => res.json())
        .then(data => {
          setFileAccessData(data)
          setFileAccessDataLoaded(true)
        })
    }
  }, [dataControllerLoad, weekRange, gradeRange])

  const onWeekChangeHandler = value => {
    // Update week range slider
    setWeekRange(value)
  }

  const gradeRangeHandler = event => {
    // Update grade range selection
    const value = event.target.value
    setGradeRange(value)
    if(defaultValue === value){
      setDefaultCheckedState(true)
      setDefaultLabel(currentSetting)
    }else{
      setDefaultCheckedState(false)
      setDefaultLabel(rememberSetting)
    }
  }

  const FileAccessChartBuilder = (fileData) => {
    if (!fileData || fileData.length === 0) {
      return (<p>No data provided</p>)
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

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom className="title">Files Accessed</Typography>
            {dataControllerLoad === 2 ? <RangeSlider
              curWeek={curWeek}
              className="slider"
              startWeek={weekRange[0]}
              endWeek={weekRange[1]}
              min={minMaxWeek[0]}
              max={minMaxWeek[1]}
              onWeekChange={onWeekChangeHandler}
            /> : ''}
            <div className={classes.formController}>
              <p>File accessed from
                week <b>{weekRange[0]} {weekRange[0] === curWeek ? ' (Now)' : ''}</b> to <b>{weekRange[1]}{weekRange[1] === curWeek ? ' (Now)' : ''}</b> with
                these grades:</p>
              <FormControl className={classes.formControl}>
                <Select
                  value={gradeRange}
                  onChange={gradeRangeHandler}
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
            {fileAccessDataLoaded
              ? FileAccessChartBuilder(fileAccessData)
              : <Spinner/>}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(FilesAccessed)
