import React, { useState } from 'react'
import { useLocation } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import Modal from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles((theme) => ({
  modal: {
    top: '10%',
    left: '50%',
    transform: 'translate(-50%)'
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px'
  },
  iframeContainer: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '150%'
  },
  /* Then style the iframe to fit in the container div with full height and width */
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%'
  },
  surveyButton: {
    color: theme.palette.primary.main,
    background: theme.palette.getContrastText(theme.palette.primary.main)
  }
}))

export default function SurveyModal (props) {
  const classes = useStyles()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const lastTwoSteps = location.pathname.split('/').slice(-2)
  const viewName = lastTwoSteps.length < 2
    ? ''
    : lastTwoSteps[0] === 'courses'
      ? 'courses'
      : lastTwoSteps[1]

  const params = {
    userID: props.user.LTIlaunchID,
    userName: props.user.username,
    courseID: props.courseID,
    view: viewName
  }
  const searchParams = new URLSearchParams()
  Object.entries(params).map(([key, value]) => searchParams.append(key, value))

  const toggleOpen = () => setOpen(!open)

  const body = (
    <div className={`${classes.paper} ${classes.modal}`}>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <h4 id='survey-modal-title'>{props.surveyLink.text}</h4>
        <IconButton onClick={toggleOpen}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <div id='survey-modal-description'>
        <div className={classes.iframeContainer}>
          <iframe className={classes.iframe} src={`${props.surveyLink.url}?${searchParams.toString()}`} height='600px' width='400px' />
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <Button variant='contained' className={classes.surveyButton} onClick={toggleOpen}>{props.surveyLink.text}</Button>
      <Modal
        open={open}
        onClose={toggleOpen}
        aria-labelledby='survey-modal-title'
        aria-describedby='survey-modal-description'
      >
        {body}
      </Modal>
    </div>
  )
}
