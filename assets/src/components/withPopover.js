import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'

const withPopover = Component => props => {
  const { popoverText } = props

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  return (
    <div>
      <Button
        aria-owns={open ? 'simple-popper' : undefined}
        aria-haspopup='true'
        variant='contained'
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        {popoverText}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Component {...props} />
      </Popover>
    </div>
  )
}

export default withPopover
