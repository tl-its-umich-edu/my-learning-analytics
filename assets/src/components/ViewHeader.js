import React, { useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'

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
    variant: 'h5',
    gutterBottom: true,
    ref: domElement => setDomElement(domElement)
  }
  // Let the header be focus-able only until it has finished being announced (i.e. the focus moves)
  if (!announced) {
    headerProps.tabIndex = -1
  }

  return (
    <Typography {...headerProps} onBlur={handleBlur}>
      {children}
    </Typography>
  )
}

export default ViewHeader
