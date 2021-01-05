import { useState } from 'react'

function usePopoverEl () {
  const emptyPopoverEl = { popoverId: null, anchorEl: null }
  const [popoverEl, setPopoverEl] = useState(emptyPopoverEl)

  const setNewPopoverEl = (key, el) => setPopoverEl({ popoverId: key, anchorEl: el })

  const clearPopoverEl = () => setPopoverEl(emptyPopoverEl)

  return [popoverEl, setNewPopoverEl, clearPopoverEl]
}

export default usePopoverEl
