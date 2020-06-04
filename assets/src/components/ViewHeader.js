import React, { useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import useTimeout from '../hooks/useTimeout'

function ViewHeader (props) {
  const [domElement, setDomElement] = useState(null)
  const [focused, setFocused] = useState(false)
  const [announced, setAnnounced] = useState(false)
  const { children } = props

  // Focuses the page header only when the domElement changes.
  // This should only be when it changes from null to something on initial render.
  useEffect(() => {
    if (domElement !== null) {
      domElement.focus()
      setFocused(true)
    }
  }, [domElement])

  // Un-focuses the page header after two seconds.
  useTimeout(() => {
    if (focused) {
      domElement.blur()
      setFocused(false)
      setAnnounced(true)
    }
  }, 2000)

  const headerProps = {
    variant: 'h5',
    gutterBottom: true,
    ref: domElement => setDomElement(domElement)
  }
  // Let the header be focus-able only until it has finished being announced
  if (!announced) {
    headerProps.tabIndex = -1
  }

  return (
    <Typography {...headerProps}>
      {children}
    </Typography>
  )
}

export default ViewHeader
