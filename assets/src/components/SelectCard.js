import React, { useState} from 'react';
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { CardActions, IconButton, Button, Snackbar, Slide, CircularProgress, Divider, Fab } from '@material-ui/core'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CloseIcon from '@material-ui/icons/Close';
import { Link } from 'react-router-dom'
import { Save } from '@material-ui/icons';
import { yellow, grey } from '@material-ui/core/colors';
import SaveIcon from '@material-ui/icons/Save';
import { color } from 'd3';
import { removeData } from 'jquery';
import clsx from 'clsx';
import { defaultFetchOptions,handleError } from '../util/data'

const styles = theme => ({
  card: {
    margin: theme.spacing(3)
    
  },
  media: {
    height: 140,
    backgroundSize: 'auto'
  },
  content: {
    height: 110,
    padding: 0
  },
  title: {
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    color: 'white',
    marginBottom: 0,
    backgroundColor: theme.palette.primary.main
  },
  description: {
    padding: theme.spacing(1),
    color: 'black'
  },

  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  fabProgress: {
    color: yellow[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonEnabled: {

  },
  buttonDisabled: {
    backgroundColor: grey[500],
    '&:hover': {
      backgroundColor: grey[700],
    },
  },
  checkbox:{
    backgroundColor:'transparent'
  }
})

const SelectCard = props => {
  const { classes, cardData, courseId } = props
  const { viewCode } = cardData
  const [ enabled, setEnabled] = useState(cardData.enabled)
  const [ snackbarMessage, setResponseMessage] = useState('Saved')
  const [ snackbarOpen, setSnackbarOpen] =  useState(false)
  const [ saving, setSaving] = useState(false)
  const timer = React.useRef();
  const buttonClassname = clsx({
    [classes.buttonEnabled]: enabled,
    [classes.buttonDisabled]: !enabled,
  });



  const handleSnackbarClose = () =>{
    setSnackbarOpen(false)
  }

  const save = (isEnabled)=> {

    setSaving(true)
    saveAsync(isEnabled).then(x=>{
      setSaving(false)
      
      if ( x ) {
        setResponseMessage('Setting saved')
        setEnabled(isEnabled)
      } else {
        setResponseMessage('Error saving setting')
      }

      setSnackbarOpen(true)

    }).catch(e=>{
      setSaving(false)
      setResponseMessage('Error saving setting')
      console.log("Save Error "+e)
      setSnackbarOpen(true)
    })
    
  }

  var saveAsync = function(isEnabled) {
    let payLoad = JSON.parse('{"'+viewCode+'":{"enabled":'+isEnabled+'}}')
    
      const dataURL = `/api/v1/courses/${courseId}/update_info/`
    const fetchOptions = { method: 'PUT', ...defaultFetchOptions, body:JSON.stringify(payLoad) }
    return fetch(dataURL, fetchOptions)
      .then(handleError)
      .then(res => res.json())
      .then(data => {
        return (data.default==="success")
      })
      .catch(_ => {
        return false
      })
  }

  const SlideTransition = (props) => {
    return <Slide {...props} direction='up' />
  }

  const snackbarDuration = Math.max(snackbarMessage.length * 200, 4000)

  return (
    <>
    <Card className={classes.card} elevation={2}>
      <Link tabIndex={-1} style={{ textDecoration: 'none' }} to={cardData.path}>
        {
          cardData.image
            ? (
              <CardMedia
                className={classes.media}
                image={cardData.image}
                title={cardData.title}
              />
            ) : null
        }
        
        <CardContent className={classes.content}>
          <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
            {cardData.title}
          </Typography>
          <Typography component='p' className={classes.description}>
            {cardData.description}
          </Typography>
          
        </CardContent>
      </Link>
      {
          props.isAdmin || props.enrollment_type==="TeacherEnrollment"
          ? (
            <>
            <Divider/>
            <CardActions>
              <div className={classes.root}>
                <div className={classes.wrapper}>
                  <Fab
                    size="small"
                    aria-label="save"
                    color="primary"
                    className={buttonClassname}
                    onClick={()=>{save(!enabled)}}
                    disabled={saving}
                  >
                    {saving ? <SaveIcon/> : enabled ? <CheckBoxIcon className={classes.checkbox} /> : <CheckBoxOutlineBlankIcon className={classes.checkbox}/>}
                  </Fab>
                  {saving && <CircularProgress size={52} className={classes.fabProgress} />}
                </div>
              </div>
              {enabled?'Enabled':'Disabled'}
            </CardActions>
          </>
          ) : null
        }
    </Card>

    <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarOpen}
        autoHideDuration={snackbarDuration}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={[
          <IconButton
            key='close'
            aria-label='close'
            color='inherit'
            onClick={() => setSnackbarOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />

    </>
  )
}

export default withStyles(styles)(SelectCard)
