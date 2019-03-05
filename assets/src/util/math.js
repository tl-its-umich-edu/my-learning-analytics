const toTwoDecimal = decimal => Math.round(decimal * 100) / 100

const average = arr =>
  Math.round((arr.reduce((acc, cur) => acc + cur, 0) / arr.length) * 10) / 10

const pearsonCorrelation = (prefs, p1, p2) => {
  let si = []

  for (let key in prefs[p1]) {
    if (prefs[p2][key]) si.push(key)
  }

  let n = si.length

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

  let num = pSum - (sum1 * sum2 / n)
  let den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
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
  return toTwoDecimal(stdDev)
}

export {
  average,
  pearsonCorrelation,
  standardDeviation
}
