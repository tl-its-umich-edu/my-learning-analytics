import React, { useState} from 'react';
import { withStyles } from '@material-ui/core/styles'

import { Button, Checkbox, FormControl, FormGroup, FormControlLabel, Grid} from '@material-ui/core'
import { Link } from 'react-router-dom';
import SelectCard from '../SelectCard';
import routes from '../../routes/routes'

const styles = theme => ({
  li: {
    listStyleType: 'none'
  },
  courseoptions: {
    margin:'15px'
  }
})

function CourseAdmin(props) {

  const { courseInfo, courseId } = props
  const views = courseInfo.course_view_options
  const { classes } = props;
  const courseName = 'Course Name Goes Here'


  const [options, setOptions] = useState({
    "apv1": { 'enabled':!!views.apv1},
    "ap": { 'enabled':!!views.ap},
    "gd": { 'enabled':!!views.gd, "show_grade_counts":true},
    "ra": { 'enabled':!!views.ra}
  })
  
  const save = () =>{

  }

  const handleChange = (event, viewCode) => {
    options[viewCode].enabled=event.target.checked
    setOptions({
      "apv1": { 'enabled':options['apv1'].enabled},
      "ap": { 'enabled':options['ap'].enabled},
      "gd": { 'enabled':options['gd'].enabled, "show_grade_counts":options['gd'].show_grade_counts},
      "ra": { 'enabled':options['ra'].enabled}
    })
  }

  return (
    <FormControl onSubmit={save()}>
      <Grid container>
        {
          routes(courseId, views).map((props, key) => (

            <Grid item xs={12} sm={6} lg={4} key={key}>
              <Link tabIndex={-1} style={{ textDecoration: 'none' }} to={props.path}>
                <SelectCard cardData={props} />
              </Link>
              <Grid container>
                <Grid item xs={12}>
                  <FormControlLabel
                    value='Enable'
                    control={<Checkbox id={props.viewCode} color="primary" checked={options[props.viewCode].enabled} onChange={()=>handleChange(event, props.viewCode)}/>}
                    label='Enable'
                    labelPlacement="end"
                  />

                </Grid>              
              </Grid>
              
            </Grid>
            
          ))
        }
      </Grid>
    </FormControl>
  )
}

export default withStyles(styles)(CourseAdmin);