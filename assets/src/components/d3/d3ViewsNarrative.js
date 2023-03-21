import { isInRange, isOutOfRange } from '../../util/math'

const createGradesText = (data, bins, gradesSummary, myGrade, firstGradeAfterBinnedGrade) => {
  const isBinningUsed = new Set(data.slice(0, 5)).size === 1
  const binningNarrativeText = () => {
    if (isOutOfRange(myGrade, firstGradeAfterBinnedGrade)) {
      return `Grades at around ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower are placed into one bin, and your grade ${myGrade}% falls into this bin. `
    } else {
      return `Grades at around ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower are placed into one bin. `
    }
  }
  const narrativeTextGrades = {}
  narrativeTextGrades.courseStats = `Course information: Class size = ${gradesSummary.tot_students}, Average grade = ${gradesSummary.grade_avg}%, Median grade = ${gradesSummary.median_grade}%.`
  narrativeTextGrades.binnedGradeText = isBinningUsed ? binningNarrativeText() : ''
  narrativeTextGrades.courseGrades = []
  for (const gradeBin in bins) {
    if (bins[gradeBin].length > 0) {
      const binLowerLimit = bins[gradeBin].x0
      const binUpperLimit = bins[gradeBin].x1
      if (isInRange(myGrade, binLowerLimit, binUpperLimit) && myGrade) {
        narrativeTextGrades.courseGrades.push(`${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range, and your grade ${myGrade}% is in this range. `)
      } else {
        narrativeTextGrades.courseGrades.push(`${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range. `)
      }
    }
  }
  return narrativeTextGrades
}
export {
  createGradesText
}
