const roundToXDecimals = (num, x) => {
  const tenToTheX = 10 ** x
  return Math.round(num * tenToTheX) / tenToTheX
}

const getDecimalPlaceOfFloat = (floatNum) => (floatNum.toString().split('.')[1]).length

const average = arr => arr.reduce((acc, cur) => acc + cur, 0) / arr.length

const median = arr => {
  const sorted = arr.sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const isEven = sorted.length % 2 === 0
  return isEven
    ? (sorted[middle] + sorted[middle - 1]) / 2
    : sorted[middle]
}

const isInRange = (data, lowerLimit, upperLimit) => {
  if ((data >= lowerLimit) && (data <= upperLimit)) {
    return true
  } else { return false }
}

const isOutOfRange = (data, checkPointData) => {
  if (data !== null && data <= checkPointData) {
    return true
  } else { return false }
}

const sum = arr => arr.reduce((acc, cur) => (acc += cur), 0)

// Use decimal place of pointsPossible if it's a decimal; otherwise, round to nearest tenth
const placeToRoundTo = pointsPossible => (String(pointsPossible).includes('.'))
  ? getDecimalPlaceOfFloat(pointsPossible) : 1

export {
  average,
  getDecimalPlaceOfFloat,
  median,
  roundToXDecimals,
  sum,
  isInRange,
  isOutOfRange,
  placeToRoundTo
}
