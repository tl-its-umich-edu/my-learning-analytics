const isObjectEmpty = obj => Object.keys(obj).length === 0

// could use Object.values but support isn't widespread yet
const getObjectValues = obj => Object.keys(obj).map(key => obj[key])

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

export {
  isObjectEmpty,
  getObjectValues,
  createEventLog
}
