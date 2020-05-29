const roundToXDecimals = (num, x) => {
  const tenToTheX = 10 ** x
  return Math.round(num * tenToTheX) / tenToTheX
}

const getDecimalPlaceOfFloat = (floatNum) => (floatNum.toString().split('.')[1]).length

const average = arr => arr.reduce((acc, cur) => acc + cur, 0) / arr.length

const pearsonCorrelation = (prefs, p1, p2) => {
  const si = []

  for (const key in prefs[p1]) {
    if (prefs[p2][key]) si.push(key)
  }

  const n = si.length

  if (n === 0) return 0

  let sum1 = 0
  for (let i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]]

  let sum2 = 0
  for (let i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]]

  let sum1Sq = 0
  for (let i = 0; i < si.length; i++) {
    sum1Sq += Math.pow(prefs[p1][si[i]], 2)
  }

  let sum2Sq = 0
  for (let i = 0; i < si.length; i++) {
    sum2Sq += Math.pow(prefs[p2][si[i]], 2)
  }

  let pSum = 0
  for (let i = 0; i < si.length; i++) {
    pSum += prefs[p1][si[i]] * prefs[p2][si[i]]
  }

  const num = pSum - (sum1 * sum2 / n)
  const den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
    (sum2Sq - Math.pow(sum2, 2) / n))

  if (den === 0) return 0

  return num / den
}

const standardDeviation = values => {
  const mean = values.reduce((acc, cur) => (acc + cur), 0) / values.length

  const squareDiffs = values.map(val => {
    const diff = val - mean
    const sqrDiff = diff * diff
    return sqrDiff
  })

  const avgSquareDiff = squareDiffs.reduce((acc, cur) => (acc + cur), 0) / squareDiffs.length

  const stdDev = Math.sqrt(avgSquareDiff)
  return roundToXDecimals(stdDev, 2)
}

const median = arr => {
  const sorted = arr.sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const isEven = sorted.length % 2 === 0
  return isEven
    ? (sorted[middle] + sorted[middle - 1]) / 2
    : sorted[middle]
}

const sum = arr => arr.reduce((acc, cur) => (acc += cur), 0)

export {
  average,
  getDecimalPlaceOfFloat,
  median,
  pearsonCorrelation,
  roundToXDecimals,
  standardDeviation,
  sum
}
