import { useState } from 'react'
import { createEventLog } from '../util/object'

const useEventLog = (event, currentGrade, maxPossibleGrade) => {
  const [eventLog, setEventLog] = useState({ count: 0, eLog: {} })

  if (eventLog.count === 0) {
    event.current
  }

  return eventLog
}
