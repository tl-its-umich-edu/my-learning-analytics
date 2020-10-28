import { isInRange, isOutOfRange } from '../../util/chartsMisc'

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
      ? `${x.resource_name.split('|')[1]} accessed ${x.total_percent}% last time you accessed on ${new Date(x.self_access_last_time).toDateString()}`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} accessed ${x.total_percent}% last time you accessed on ${new Date(x.self_access_last_time).toDateString()}`}`)
  return narrativeTextResources
}
const grades = (data, bins, gradesSummary, myGrade, firstGradeAfterBinnedGrade) => {
  const isBinningUsed = new Set(data.slice(0, 5)).size === 1
  const binningNarrativeText = () => {
    if (isOutOfRange(myGrade, firstGradeAfterBinnedGrade)) {
      return `First grades are binned at ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower and your grade ${myGrade} fall in this bin. `
    } else {
      return `First grades are binned at ${Math.trunc(firstGradeAfterBinnedGrade)}% or lower. `
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
        narrativeTextGrades.courseGrades.push(`${bins[gradeBin].length} grades in ${binLowerLimit} - ${binUpperLimit}% range and your grade ${myGrade}% is in this range `)
      } else {
        narrativeTextGrades.courseGrades.push(`${(narrativeTextGrades.courseGrades.length !== 0
          ? `${bins[gradeBin].length} in ${binLowerLimit} - ${binUpperLimit}% `
          : `${bins[gradeBin].length} grades in ${binLowerLimit} - ${binUpperLimit}% range`)}`)
      }
    }
  }
  return narrativeTextGrades
}
export {
  resources,
  grades
}
