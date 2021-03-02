import { useState } from 'react'

const createEventLog = (v, eventLog, currentGrade, maxPossibleGrade) => {
  // only sending current and max grade when user change the setting for first time since these are not user controlled parameters
  if (eventLog.count === 0) {
    v.currentGrade = currentGrade
    v.maxPossibleGrade = maxPossibleGrade
  }
  const final = {
    count: eventLog.count + 1,
    eLog: v
  }

  return final
}


const useEventLog = (v, event, currentGrade, maxPossibleGrade) => {
  const [eventLog, setEventLog] = useState({ count: 0, eLog: {} })

  if (eventLog.count === 0) {
    event.current
  }

  return [eventLog, setEventLog]
}
