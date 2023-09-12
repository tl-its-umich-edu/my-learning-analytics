const isObjectEmpty = obj => Object.keys(obj).length === 0

// could use Object.values but support isn't widespread yet
const getObjectValues = obj => Object.keys(obj).map(key => obj[key])

const isObjectGDLimit = obj => {
  const expectedProperties = ['gd_disable', 'gd_msg']
  const hasAllProperties = expectedProperties.every(property => Object.keys(obj).includes(property))
  if (hasAllProperties) {
    return true
  } else {
    return false
  }
}

const eventLogExtra = (v, eventLog, currentGrade, maxPossibleGrade) => {
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
  eventLogExtra,
  isObjectGDLimit
}
