import React, { useState, useEffect, useCallback } from 'react'
import Snackbar from '@mui/material/Snackbar'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import debounce from 'lodash.debounce'

function SlideTransition (props) {
  return <Slide {...props} direction='up' />
}

function UserSettingSnackbar (props) {
  const {
    saved,
    response,
    successMessage = 'Setting saved successfully!',
    failureMessage = 'Setting not saved.',
    debounceAmount = 0
  } = props

  const [savedSnackbarOpen, setSavedSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const openSnackbarWithDebounce = useCallback(
    debounce((message) => {
      setSnackbarMessage(message)
      setSavedSnackbarOpen(true)
    }, debounceAmount),
    [debounceAmount]
  )

  useEffect(() => {
    if (saved) {
      const message = response.default === 'success' ? successMessage : failureMessage
      openSnackbarWithDebounce(message)
    }
  }, [saved, openSnackbarWithDebounce])

  const snackbarDuration = Math.max(snackbarMessage.length * 200, 4000)

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
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
