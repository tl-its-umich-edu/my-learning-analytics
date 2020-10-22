const isInRange = (data, lowerLimit, upperLimit) => {
  if ((data > lowerLimit) && (data < upperLimit)) {
    return true
  } else { return false }
}

const isOutOfRange = (data, checkPointData) => {
  if (data !== null && data < checkPointData) {
    return true
  } else { return false }
}

export {
  isInRange,
  isOutOfRange
}
