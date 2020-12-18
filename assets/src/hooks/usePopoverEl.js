import { useState } from 'react'

function usePopoverEl () {
  const emptyPopover = { popoverId: null, anchorEl: null }
  const [popoverEl, setPopoverEl] = useState(emptyPopover)

  const setPopover = (key, el) => {
    setPopoverEl({ popoverId: key, anchorEl: el })
  }
  const clearPopover = () => setPopoverEl(emptyPopover)

  return [popoverEl, setPopover, clearPopover]
}

export default usePopoverEl
