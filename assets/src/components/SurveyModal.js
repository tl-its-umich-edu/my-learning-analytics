import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { useLocation } from 'react-router-dom'
import Button from '@mui/material/Button'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import CloseIcon from '@mui/icons-material/Close'

const PREFIX = 'SurveyModal'

const classes = {
  modal: `${PREFIX}-modal`,
  paper: `${PREFIX}-paper`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  iframeContainer: `${PREFIX}-iframeContainer`,
  iframe: `${PREFIX}-iframe`,
  surveyButton: `${PREFIX}-surveyButton`
}

// styling within the modal (root styling doesn't apply to portal elements)
const StyledModalBody = styled('div')(({ theme }) => ({
  [`& .${classes.modal}`]: {
    top: '10%',
    left: '50%',
    transform: 'translate(-50%)'
  },

  [`& .${classes.paper}`]: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  },

  [`& .${classes.dialogTitle}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px'
  },

  [`& .${classes.iframeContainer}`]: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '150%'
  },

  /* Then style the iframe to fit in the container div with full height and width */
  [`& .${classes.iframe}`]: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%'
  }
}))

const ColoredButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: '#D5D5D5'
  }
}))

export default function SurveyModal (props) {
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
      <DialogTitle className={classes.dialogTitle}>
        <h4 id='survey-modal-title'>{props.surveyLink.text}</h4>
        <IconButton onClick={toggleOpen} size='large'>
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
    <>
      <ColoredButton variant='contained' onClick={toggleOpen}>{props.surveyLink.text}</ColoredButton>
      <Modal
        open={open}
        onClose={toggleOpen}
        aria-labelledby='survey-modal-title'
        aria-describedby='survey-modal-description'
      >
        <StyledModalBody>{body}</StyledModalBody>
      </Modal>
    </>
  )
}
