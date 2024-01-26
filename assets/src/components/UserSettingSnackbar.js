import React, { useState, useEffect } from 'react'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'

function SlideTransition (props) {
  return <Slide {...props} direction='up' />
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

  const snackbarDuration = Math.max(snackbarMessage.length * 200, 4000)

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      ContentProps={{
        role: 'alertdialog'
      }}
      open={savedSnackbarOpen}
      autoHideDuration={snackbarDuration}
      TransitionComponent={SlideTransition}
      transitionDuration={{ exit: 400, enter: 400 }}
      onClose={() => setSavedSnackbarOpen(false)}
      message={<span>{snackbarMessage}</span>}
      action={[
        <IconButton
          key='close'
          aria-label='close'
          color='inherit'
          onClick={() => setSavedSnackbarOpen(false)}
          size='large'
        >
          <CloseIcon />
        </IconButton>
      ]}
    />
  )
}

export default UserSettingSnackbar
