import { isInRange, isOutOfRange } from '../../util/math'

const resources = (resourceData, resourceType, gradeSelection, weekRange) => {
  const unAccessedResources = resourceData.filter(resource => resource.self_access_count === 0)
  const accesedResources = resourceData.filter(resource => resource.self_access_count === 1)
  const narrativeTextResources = {}
  narrativeTextResources.weekRange = `Resources accessed from week ${weekRange[0]} to ${weekRange[1]}.  `
  narrativeTextResources.resourceType = `Selected resource type is ${resourceType}.  `
  narrativeTextResources.gradeFilter = gradeSelection.toUpperCase() !== 'ALL' ? `Filtering on grades ${gradeSelection}.  ` : ''
  narrativeTextResources.resourcesUnaccessCount = `You have not yet accessed ${unAccessedResources.length} of ${resourceData.length} resources.  `
  narrativeTextResources.resourcesAccessCount = `${accesedResources.length !== 0 ? `. You have accessed ${accesedResources.length} of ${resourceData.length} resources.  ` : ''}`
  narrativeTextResources.resourcesUnAccessList = unAccessedResources.map(x =>
    `${resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} accessed ${x.total_percent}%`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} accessed ${x.total_percent}%`}`
  )
  narrativeTextResources.resourceAccessList = accesedResources.map(x =>
    `${resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`}`)
  return narrativeTextResources
}
const grades = (data, bins, gradesSummary, firstGradeAfterBinnedGrade) => {
  const myGrade = gradesSummary.current_user_grade
  const isBinningUsed = new Set(data.slice(0, 5)).size === 1
  const binningNarrativeText = () => {
    if (isOutOfRange(myGrade, firstGradeAfterBinnedGrade)) {
      return `Grades at around ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower are placed into one bin, and your grade ${myGrade}% falls into this bin. `
    } else {
      return `Grades at around ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower are placed into one bin. `
    }
  }
  const userGradeInBinnedGroup = () => {
    return isBinningUsed ? binningNarrativeText() : ''
  }
  const narrativeTextGrades = {}
  narrativeTextGrades.courseStats = `Course information: Class Size = ${gradesSummary.tot_students}, Average grade = ${gradesSummary.grade_avg}%, Median grade = ${gradesSummary.median_grade}%.`
  narrativeTextGrades.binnedGradeText = userGradeInBinnedGroup()
  narrativeTextGrades.courseGrades = []
  for (const gradeBin in bins) {
    if (bins[gradeBin].length > 0) {
      const binLowerLimit = bins[gradeBin].x0
      const binUpperLimit = bins[gradeBin].x1
      if (isInRange(myGrade, binLowerLimit, binUpperLimit) && myGrade) {
        narrativeTextGrades.courseGrades.push(`${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range, and your grade ${myGrade}% is in this range `)
      } else {
        narrativeTextGrades.courseGrades.push(`${(narrativeTextGrades.courseGrades.length !== 0
          ? `${bins[gradeBin].length} in the ${binLowerLimit} to ${binUpperLimit}%`
          : `${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range`)}`)
      }
    }
  }
  return narrativeTextGrades
}
export {
  resources,
  grades
}
