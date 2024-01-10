/* global fetch */

import React, { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import AlertBanner from '../components/AlertBanner'
import IconLabel from '../components/IconLabel'
import RangeSlider from '../components/RangeSlider'
import ResourceAccessChart from '../components/ResourceAccessChart'
import ResourceChartNarrative from '../components/ResourceChartNarrative'
import Spinner from '../components/Spinner'
import UserSettingSnackbar from '../components/UserSettingSnackbar'
import ViewHeader from '../components/ViewHeader'
import useSetUserSetting from '../hooks/useSetUserSetting'
import useUserSetting from '../hooks/useUserSetting'
import { isObjectEmpty } from '../util/object'
import { handleError, defaultFetchOptions } from '../util/data'
import { isTeacherOrAdmin } from '../util/roles'
import { Helmet } from 'react-helmet'

const PREFIX = 'ResourcesAccessed'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  formController: `${PREFIX}-formController`,
  controlText: `${PREFIX}-controlText`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1,
    padding: 8
  },

  [`& .${classes.paper}`]: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(2)
  },

  [`& .${classes.formController}`]: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2)
  },

  [`& .${classes.controlText}`]: {
    marginRight: 16
  }
}))

const currentSetting = 'My current setting'
const rememberSetting = 'Remember my setting'
const settingNotUpdated = 'Setting not updated'

function ResourcesAccessed (props) {
  const { courseInfo, courseId, disabled, isAdmin, enrollmentTypes } = props
  if (disabled && !isTeacherOrAdmin(isAdmin, enrollmentTypes)) return (<AlertBanner>The Resources Accessed view is hidden for this course.</AlertBanner>)
  const resourceTypes = courseInfo.resource_types.length === 0
    ? [{ label: 'Files', icon: 'fas fa-file fa-lg' }]
    : courseInfo.resource_types
  const resourceTypeLabels = resourceTypes.map((el) => el.label)

  const [showSaveSetting, setShowSaveSetting] = useState(false)
  const [saveSettingClicked, setSaveSettingClicked] = useState(false)

  const [minMaxWeek, setMinMaxWeek] = useState([]) // Should be updated from info
  const [curWeek, setCurWeek] = useState(0) // Should be updated from info
  const [weekRange, setWeekRange] = useState([]) // Should be depend on curWeek
  const [resourceGradeFilter, setResourceGradeFilter] = useState('') // Should be fetched from default
  const [resourceTypeFilter, setResourceTypeFilter] = useState(resourceTypeLabels)
  // this is the filter setting last saved by the user
  const [userSavedFilterSetting, setUserSavedFilterSetting] = useState(resourceGradeFilter)
  const [resourceAccessData, setResourceAccessData] = useState('')
  const [resourcesLimit, setResourcesLimit] = useState(undefined)

  const [dataControllerLoad, setDataControllerLoad] = useState(0)

  const [userSettingLoaded, userSetting] = useUserSetting(courseId, 'resource')

  const [saveLabel, setSaveLabel] = useState(currentSetting)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [userSettingSaved, savingError, userSettingResponse] = useSetUserSetting(
    courseId,
    { resource: resourceGradeFilter },
    userSavedFilterSetting !== resourceGradeFilter && saveSettingClicked, // only save if the filter setting last saved does not equal the current grade filter, and checkbox is checked.
    [saveSettingClicked]
  )

  const onChangeResourceTypeHandler = event => {
    setDataLoaded(false)
    const value = event.target.value
    const checked = event.target.checked
    if (checked && !resourceTypeFilter.includes(value)) {
      setResourceTypeFilter([...resourceTypeFilter, value])
    } else if (!checked) {
      setResourceTypeFilter(resourceTypeFilter.filter(val => val !== value))
    }
  }

  function filterCheckbox () {
    if (resourceAccessData) {
      if (resourceTypes.length > 1) {
        return (
          <div style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            <FormControl>
              <FormGroup row>
                <p className={classes.controlText}>Select resource types to be viewed:</p>
                {
                  resourceTypes.map((el, i) => (
                    <FormControlLabel
                      key={i}
                      control={<Checkbox color='secondary' defaultChecked onChange={onChangeResourceTypeHandler} value={el.label} />}
                      label={<IconLabel label={el.label} icon={el.icon} />}
                    />))
                }
              </FormGroup>
            </FormControl>
          </div>
        )
      } else if (resourceTypes.length === 1) {
        const message = 'You are viewing ' + resourceTypes[0].label + ' data'
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold' }}>{message}</p>
          </div>
        )
      }
    }
  }

  useEffect(() => {
    // if user setting is different from current grade filter, show label for remembering setting
    if (userSavedFilterSetting !== resourceGradeFilter) {
      setSaveLabel(rememberSetting)
    } else if (savingError) {
      setSaveLabel(settingNotUpdated)
    } else {
      setSaveLabel(currentSetting)
    }
  })

  // if user setting is saved, don't show checkbox and sync userSavedFilterSetting with assignmentGradeFilter
  useEffect(() => {
    if (userSettingSaved) {
      setShowSaveSetting(false)
      setUserSavedFilterSetting(resourceGradeFilter)
    }
  }, [userSettingSaved])

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
    if (userSettingLoaded) {
      if (isObjectEmpty(userSetting.default)) {
        setResourceGradeFilter('All')
        setUserSavedFilterSetting('All')
      } else {
        setResourceGradeFilter(userSetting.default)
        setUserSavedFilterSetting(userSetting.default)
      }
      setDataControllerLoad(dataControllerLoad + 1)
    }
  }, [userSettingLoaded])

  useEffect(() => {
    // Fetch data once all the setting data is fetched
    if (dataControllerLoad === 2 && !(resourceTypeFilter.length === 0)) {
      const params = new URLSearchParams({
        week_num_start: weekRange[0],
        week_num_end: weekRange[1],
        grade: resourceGradeFilter,
        resource_type: resourceTypeFilter
      })
      const dataURL = `/api/v1/courses/${courseId}/resource_access_within_week/?${params.toString()}`
      const fetchOptions = { method: 'get', ...defaultFetchOptions }
      fetch(dataURL, fetchOptions)
        .then(handleError)
        .then((response) => {
          if (response.headers.has('Resources-Limit')) {
            setResourcesLimit(response.headers.get('Resources-Limit'))
          }
          return response.json()
        })
        .then(data => {
          setResourceAccessData(data)
          setDataLoaded(true)
        })
        .catch(_ => {
          setResourceAccessData({})
        })
    } else {
      setResourceAccessData({})
    }
  }, [dataControllerLoad, weekRange, resourceGradeFilter, resourceTypeFilter])

  const onWeekChangeHandler = value => {
    // Update week range slider
    setWeekRange(value)
  }

  const handleResourceGradeFilter = event => {
    // Update grade range selection
    const value = event.target.value
    setResourceGradeFilter(value)

    if (userSavedFilterSetting !== value) {
      setSaveSettingClicked(false)
      setShowSaveSetting(true)
    } else {
      setShowSaveSetting(false)
    }
  }

  const resourceAccessChartBuilder = (resourceData, resourcesLimit) => {
    if (resourceTypeFilter.length === 0) {
      return (<AlertBanner>Please select a resource type to display data.</AlertBanner>)
    } else if (!resourceData || Object.keys(resourceData).length === 0) {
      return (<AlertBanner>Resource data for your selections is not available.</AlertBanner>)
    } else {
      const resourceDataSorted = resourceData.sort((a, b) => b.total_percent - a.total_percent)
      return (
        <>
          <Typography style={{ textAlign: 'center' }} gutterBottom>
            {`Displaying ${resourcesLimit ?? 'all available'} resources in this course`}
          </Typography>
          <ResourceChartNarrative
            data={resourceDataSorted}
            weekRange={weekRange}
            gradeSelection={resourceGradeFilter}
            resourceType={resourceTypeFilter}
          />
          <ResourceAccessChart
            data={resourceDataSorted}
            aspectRatio={0.3}
            minHeight={350}
          />
        </>
      )
    }
  }
  return (
    <Root>
      <Helmet title='Resources Accessed' />
      {disabled ? <AlertBanner>Preview Mode: This view is currently disabled for students.</AlertBanner> : undefined}
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ViewHeader>Resources Accessed</ViewHeader>
              {
                dataControllerLoad === 2
                  ? (
                    <RangeSlider
                      curWeek={curWeek}
                      className='slider'
                      startWeek={weekRange[0]}
                      endWeek={weekRange[1]}
                      min={minMaxWeek[0]}
                      max={minMaxWeek[1]}
                      onWeekChange={onWeekChangeHandler}
                    />)
                  : ''
              }
              <div className={classes.formController}>
                <p className={classes.controlText}>Resources accessed from week <b>{weekRange[0]} {weekRange[0] === curWeek ? ' (Now)' : ''}</b> to <b>{weekRange[1]}{weekRange[1] === curWeek ? ' (Now) ' : ''}</b> by students with these grades:</p>
                <FormControl variant='standard'>
                  <Select
                    value={resourceGradeFilter}
                    onChange={handleResourceGradeFilter}
                    inputProps={{
                      name: 'grade',
                      id: 'grade-range'
                    }}
                  >
                    <MenuItem value='All'>All</MenuItem>
                    <MenuItem value='90-100'>90-100%</MenuItem>
                    <MenuItem value='80-89'>80-89%</MenuItem>
                    <MenuItem value='70-79'>70-79%</MenuItem>
                  </Select>
                </FormControl>
                {
                  showSaveSetting
                    ? (
                      <Checkbox
                        checked={saveSettingClicked}
                        onChange={() => setSaveSettingClicked(!saveSettingClicked)}
                        value='checked'
                        color='secondary'
                      />)
                    : <div style={{ padding: '10px' }} />
                }
                <div style={{ padding: '15px 2px' }}>{saveLabel}</div>
              </div>
              {
                filterCheckbox()
              }
              <UserSettingSnackbar
                saved={userSettingSaved}
                response={userSettingResponse}
                successMessage='Resource filter setting saved!'
              />
              {(resourceAccessData && dataLoaded) || resourceTypeFilter.length === 0
                ? resourceAccessChartBuilder(resourceAccessData, resourcesLimit)
                : <Spinner />}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Root>
  )
}

export default (ResourcesAccessed)
