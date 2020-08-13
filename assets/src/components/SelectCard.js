/* global fetch */
import React, { useState } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Card, CardActionArea, CardActions, CardContent, CardMedia, CircularProgress, Divider, Fab, IconButton, Link as MUILink, Snackbar, Tooltip, Typography } from '@material-ui/core'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CloseIcon from '@material-ui/icons/Close'
import { Link } from 'react-router-dom'
import InfoIcon from '@material-ui/icons/Info'
import Grid from '@material-ui/core/Grid'
import { yellow, grey } from '@material-ui/core/colors'
import SaveIcon from '@material-ui/icons/Save'
import clsx from 'clsx'
import { defaultFetchOptions, handleError } from '../util/data'
import { isTeacherOrAdmin } from '../util/roles'
import PropTypes from 'prop-types'

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
  infoLink: {
    color: 'white'
  },
  viewLink: {
    outline: 'none',
    textDecoration: 'none',
    color: 'white'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  fabProgress: {
    color: yellow[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1
  },
  buttonEnabled: {

  },
  buttonDisabled: {
    backgroundColor: grey[500],
    '&:hover': {
      backgroundColor: grey[700]
    }
  },
  checkbox: {
    backgroundColor: 'transparent'
  }
})

const SelectCard = props => {
  const { classes, cardData, courseId } = props
  const { viewCode } = cardData
  const [enabled, setEnabled] = useState(props.courseInfo.course_view_options[viewCode])
  const [snackbarMessage, setResponseMessage] = useState('Saved')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const buttonClassname = clsx({
    [classes.buttonEnabled]: enabled,
    [classes.buttonDisabled]: !enabled
  })

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  const save = (isEnabled) => {
    setSaving(true)
    saveAsync(isEnabled).then(savedSuccessfully => {
      if (savedSuccessfully) {
        setResponseMessage('Setting saved')
        setEnabled(isEnabled)
        props.courseInfo.course_view_options[viewCode] = isEnabled ? 1 : 0
      } else {
        setResponseMessage('Error saving setting')
      }
      setSnackbarOpen(true)
    }).catch(e => {
      setResponseMessage('Error saving setting')
      console.log('Save Error ' + e)
      setSnackbarOpen(true)
    }).finally(
      setSaving(false)
    )
  }

  var saveAsync = function (isEnabled) {
    const payload = Object()
    payload[viewCode] = { enabled: isEnabled }
    const dataURL = `/api/v1/courses/${courseId}/update_info/`
    const fetchOptions = { method: 'PUT', ...defaultFetchOptions, body: JSON.stringify(payload) }
    return fetch(dataURL, fetchOptions)
      .then(handleError)
      .then(res => res.json())
      .then(data => {
        return (data.default === 'success')
      })
      .catch(_ => {
        return false
      })
  }

  const snackbarDuration = Math.max(snackbarMessage.length * 200, 4000)

  function getCardImage (cardData) {
    if (cardData && cardData.image) {
      return (
        <>
          <Link className={classes.viewLink} tabIndex={-1} to={cardData.path}>
            <CardMedia className={classes.media} image={cardData.image} title={cardData.title} />
          </Link>
        </>
      )
    } else {
      return null
    }
  }

  function getHelpLink (cardData) {
    if (cardData.helpUrl) {
      return (
        <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
          <Tooltip title={'About ' + cardData.title}>
            <MUILink className={classes.infoLink} href={cardData.helpUrl} target='_blank' rel='noopener noreferrer'>
              <InfoIcon />
            </MUILink>
          </Tooltip>
        </Typography>
      )
    }
  }

  function getLinkContents (cardData) {
    const cardImage = getCardImage(cardData)

    const cardContent = (
      <CardContent className={classes.content}>
        <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
          <Grid container>
            <Grid item xs={11}>
              <Link tabIndex={-1} to={cardData.path} className={classes.viewLink}>
                <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
                  {cardData.title}
                </Typography>
              </Link>
            </Grid>
            <Grid item xs={1}>
              {getHelpLink(cardData)}
            </Grid>
          </Grid>
        </Typography>
        <Link tabIndex={-1} to={cardData.path} className={classes.viewLink}>
          <Typography component='p' className={classes.description}>
            {cardData.description}
          </Typography>
        </Link>
      </CardContent>)

    return <>{cardImage}{cardContent}</>
  }

  return (
    <>
      <Card className={classes.card} elevation={2}>
        <CardActionArea>
          {getLinkContents(cardData)}
        </CardActionArea>
        {
          isTeacherOrAdmin(props.isAdmin, props.enrollmentTypes)
            ? (
              <>
                <Divider />
                <CardActions>
                  <div className={classes.root}>
                    <div className={classes.wrapper}>
                      <Fab
                        size='small'
                        aria-label='save'
                        color='primary'
                        className={buttonClassname}
                        onClick={() => { save(!enabled) }}
                        disabled={saving}
                      >
                        {
                          saving
                            ? <SaveIcon />
                            : enabled
                              ? <CheckBoxIcon className={classes.checkbox} />
                              : <CheckBoxOutlineBlankIcon className={classes.checkbox} />
                        }
                      </Fab>
                      {saving && <CircularProgress size={52} className={classes.fabProgress} />}
                    </div>
                  </div>
                  {enabled ? 'Enabled' : 'Disabled'}
                </CardActions>
              </>
            ) : null
        }
      </Card>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
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

SelectCard.propTypes = {
  cardData: PropTypes.shape({
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    helpUrl: PropTypes.string
  }).isRequired,
  courseId: PropTypes.number.isRequired,
  enrollmentTypes: PropTypes.array.isRequired
}

SelectCard.defaultProps = {}

export default withStyles(styles)(SelectCard)
