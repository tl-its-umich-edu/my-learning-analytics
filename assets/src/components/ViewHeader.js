import React, { useEffect, useState } from 'react'
import Typography from '@material-ui/core/Typography'

function ViewHeader (props) {
  const [domElement, setDomElement] = useState(null)
  const { children } = props

  // Focuses the page header only when the domElement changes.
  // This should only be when it changes from null to something on initial render.
  useEffect(() => {
    if (domElement !== null) {
      domElement.focus()
    }
  }, [domElement])

  return (
    <div tabIndex={0} ref={domElement => setDomElement(domElement)}>
      <Typography className='title' variant='h5' gutterBottom>
        {children}
      </Typography>
    </div>
  )
}

export default ViewHeader
