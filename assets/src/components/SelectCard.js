/* global fetch */
import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { Card, CardActionArea, CardActions, CardContent, CardMedia, CircularProgress, Divider, Fab, IconButton, Link as MUILink, Snackbar, Tooltip, Typography } from '@mui/material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import SaveIcon from '@mui/icons-material/Save'
import { Link } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import { yellow, grey } from '@mui/material/colors'
import clsx from 'clsx'
import { defaultFetchOptions, handleError } from '../util/data'
import { isTeacherOrAdmin } from '../util/roles'
import PropTypes from 'prop-types'

const PREFIX = 'SelectCard'

const classes = {
  card: `${PREFIX}-card`,
  media: `${PREFIX}-media`,
  content: `${PREFIX}-content`,
  title: `${PREFIX}-title`,
  titleArea: `${PREFIX}-titleArea`,
  description: `${PREFIX}-description`,
  titleLink: `${PREFIX}-titleLink`,
  infoLink: `${PREFIX}-infoLink`,
  help: `${PREFIX}-help`,
  mainCardContainer: `${PREFIX}-mainCardContainer`,
  wrapper: `${PREFIX}-wrapper`,
  fabProgress: `${PREFIX}-fabProgress`,
  buttonEnabled: `${PREFIX}-buttonEnabled`,
  buttonDisabled: `${PREFIX}-buttonDisabled`,
  checkbox: `${PREFIX}-checkbox`
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.card}`]: {
    margin: theme.spacing(3)
  },

  [`& .${classes.media}`]: {
    height: 140,
    backgroundSize: 'auto',
    objectFit: 'scale-down'
  },

  [`& .${classes.content}`]: {
    height: 110,
    padding: 0
  },

  [`& .${classes.title}`]: {
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    color: 'white',
    marginBottom: 0,
    backgroundColor: theme.palette.primary.main
  },

  [`& .${classes.titleArea}`]: {
    color: 'white',
    backgroundColor: theme.palette.primary.main
  },

  [`& .${classes.description}`]: {
    padding: theme.spacing(1),
    color: 'black',
    height: '100%'
  },

  [`& .${classes.titleLink}`]: {
    color: 'white'
  },

  [`& .${classes.infoLink}`]: {
    color: 'white'
  },

  [`& .${classes.help}`]: {
    position: 'absolute',
    zIndex: 1,
    bottom: '21%',
    right: '5.5%'
  },

  [`& .${classes.mainCardContainer}`]: {
    position: 'relative'
  },

  [`& .${classes.wrapper}`]: {
    margin: theme.spacing(1),
    position: 'relative'
  },

  [`& .${classes.fabProgress}`]: {
    color: yellow[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1
  },

  [`& .${classes.buttonEnabled}`]: {

  },

  [`& .${classes.buttonDisabled}`]: {
    backgroundColor: grey[500],
    '&:hover': {
      backgroundColor: grey[700]
    }
  },

  [`& .${classes.checkbox}`]: {
    backgroundColor: 'transparent'
  }
}))

const SelectCard = props => {
  const { cardData, courseId } = props
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

  const saveAsync = function (isEnabled) {
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
        <div>
          <CardMedia
            component='img'
            className={classes.media}
            src={cardData.image}
            alt={`Image of ${cardData.title} chart`}
          />
        </div>
      )
    } else {
      return null
    }
  }

  function getHelpLink (cardData) {
    const label = 'About ' + cardData.title
    if (cardData.helpUrl) {
      return (
        <div className={classes.help}>
          <Typography gutterBottom variant='h5' component='p'>
            <Tooltip title={label}>
              <MUILink
                className={classes.infoLink}
                href={cardData.helpUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={label}
              >
                <InfoIcon fontSize='large' />
              </MUILink>
            </Tooltip>
          </Typography>
        </div>
      )
    }
  }

  function getLinkContents (cardData) {
    const cardImage = getCardImage(cardData)

    const cardContent = (
      <CardContent className={classes.content}>
        <Grid container className={classes.titleArea}>
          <Grid item xs={10}>
            <Typography gutterBottom variant='h5' component='h2' className={classes.title}>
              {cardData.title}
            </Typography>
          </Grid>
        </Grid>
        <Typography component='p' className={classes.description}>
          {cardData.description}
        </Typography>
      </CardContent>
    )

    return <>{cardImage}{cardContent}</>
  }

  return (
    <Root>
      <Card className={classes.card} elevation={2}>
        <div className={classes.mainCardContainer}>
          <CardActionArea component={Link} to={cardData.path}>
            {getLinkContents(cardData)}
          </CardActionArea>
          {getHelpLink(cardData)}
        </div>
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
                        aria-label={`Enable ${cardData.title} view`}
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
              )
            : null
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
            size='large'
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    </Root>
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

export default (SelectCard)
