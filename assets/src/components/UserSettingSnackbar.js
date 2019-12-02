import React, { useState, useEffect } from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Fade from '@material-ui/core/Fade';
import Slide from '@material-ui/core/Slide';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

function UserSettingSnackbar (props) {
  const {
    saved,
    response,
    successMessage = 'Setting saved successfully!',
    failureMessage = 'Setting not saved.'
  } = props

  const [savedSnackbarOpen, setSavedSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    if (saved) {
      if (response.default === 'success') {
        setSnackbarMessage(successMessage)
      } else {
        setSnackbarMessage(failureMessage)
      }
      setSavedSnackbarOpen(true)
    }
  }, [saved])

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      open={savedSnackbarOpen}
      // show for 50ms for each of the characters in the message
      autoHideDuration={"{snackbarMessage}".length * 50}
      // Fade in (or slide in) for 200-400ms for saccade time for the eye to refocus
      TransitionComponent={SlideTransition}
      transitionDuration={{exit: 400, enter: 800}}
      onClose={() => setSavedSnackbarOpen(false)}
      message={<span>{snackbarMessage}</span>}
      action={[
        <IconButton
          key='close'
          aria-label='close'
          color='inherit'
          onClick={() => setSavedSnackbarOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      ]}
    />
  )
}

export default UserSettingSnackbar
