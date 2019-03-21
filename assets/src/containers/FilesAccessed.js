import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import React, {useState} from 'react'
import Slider, {Range} from 'rc-slider'
import useFetch from '../hooks/useFetch'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Spinner from '../components/Spinner'
import { useFilesAccessedAssignmentData } from '../service/api'

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

function FilesAccessed (props) {
  const { classes, match } = props
  const currentCourseId = match.params.courseId
  const [loaded, fileData] = useFetch(`http://localhost:5001/api/v1/courses/${currentCourseId}/file_access_within_week`)

  const inputState = useState({
    cur_week: 1,
    length: 10,
  });
  const [startWeek, setStartWeek] = useState(1);
  const [endWeek, setEndWeek] = useState(1);

  let info = {"canvas_id": "245664", "term_id": 17700000000000111, "name": "SI 664 001 FA 2018", "term": {"id": 17700000000000111, "canvas_id": "111", "name": "Fall 2018", "date_start": "2018-09-04 00:00:00", "date_end": "2018-12-31 00:00:00"}, "current_week_number": 28, "total_weeks": 17}

  const onStartWeekChange = (event) => {
      // Update start week
      setStartWeek(startWeek + event.target.value);
  }

  const onEndWeekChange = (event) => {
      // Update end week
      setEndWeek(endWeek + event.target.value);
  }

  // const tableBuilder = (fileData) => {
  //   console.log(JSON.parse(fileData));
  //   if (!fileData || fileData.length === 0) {
  //     return (<p>No data provided</p>)
  //   }
  //   return (<> </>)
  // }
  const wrapperStyle = { width: "100%", margin: 50 };
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant='h5' gutterBottom >Files Accessed</Typography >
              <div style={wrapperStyle}>
                <p>Range with custom handle</p>
                <Range min={0} max={20} defaultValue={[3, 10]} tipFormatter={value => `${value}%`} marks={{ 1: 1, 2: 2, 20: 20 }}/>
              </div>
            {loaded
              ? <></>
              : <Spinner />}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default withStyles(styles)(FilesAccessed)
