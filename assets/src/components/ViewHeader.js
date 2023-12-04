import React, { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'

function ViewHeader (props) {
  const [domElement, setDomElement] = useState(null)
  const [announced, setAnnounced] = useState(false)
  const { children } = props

  const handleBlur = () => { setAnnounced(true) }

  // Focuses the page header only when the domElement changes.
  // This should only be when it changes from null to something on initial render.
  useEffect(() => {
    if (domElement !== null) {
      domElement.focus()
    }
  }, [domElement])

  const headerProps = {
    className: 'view-header',
    variant: 'h5',
    display: 'inline',
    ref: domElement => setDomElement(domElement),
    onBlur: handleBlur
  }
  // Let the header be focus-able only until it has finished being announced (i.e. the focus moves)
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
