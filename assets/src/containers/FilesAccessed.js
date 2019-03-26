import React, {useState} from 'react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import Checkbox from '@material-ui/core/Checkbox';
import RangeSlider from '../components/RangeSlider';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { useFilesAccessedAssignmentData } from '../service/api'

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
    display: "flex",
    marginTop: theme.spacing.unit * 2,
    alignItems: "center",
    justifyContent: "center"
  }
})

function FilesAccessed (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId
  const [loaded, fileData] = useFilesAccessedAssignmentData(currentCourseId)

  const [startWeek, setStartWeek] = useState(1);
  const [endWeek, setEndWeek] = useState(17);
  const [gradeRange, setGradeRange] = useState("All");
  const [saveSettingState, setSaveSetting] = useState(false);

  const onWeekChangeHandler = value => {
      // Update week range
      setStartWeek(value[0]);
      setEndWeek(value[1]);
  }

  const gradeRangeHandler = event => {
    setGradeRange(event.target.value);
  }

  const saveSettingHandler = () => {
    setSaveSetting(!saveSettingState);
  }

  const tableBuilder = (fileData) => {
    if (!fileData || fileData.length === 0) {
      return (<p>No data provided</p>)
    }
    return (<> </>)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >Files Accessed</Typography >
              <RangeSlider 
                startWeek = {startWeek}
                endWeek = {endWeek}
                curWeek = {10}
                onWeekChange = {onWeekChangeHandler}
              />
              <div className={classes.formController}>
                <p>{`File accessed from week ${startWeek} to ${endWeek} with grades:`}</p>
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
                    <MenuItem value="90-100%">90-100%</MenuItem>
                    <MenuItem value="80-89%">80-89%</MenuItem>
                    <MenuItem value="70-79%">70-79%</MenuItem>
                  </Select>
                </FormControl>
                <FormControl className={classes.checkBox}>
                  <FormControlLabel
                    control={
                      <Checkbox
                      checked={saveSettingState}
                      onChange={saveSettingHandler}
                      value="checked"
                      />
                    }
                    label="Remember my setting"
                  />
                </FormControl>
              </div>
            {loaded
              ? tableBuilder(fileData)
              : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(FilesAccessed)
