import { isInRange, isOutOfRange } from '../../util/math'

const createResourcesText = (resourceData, resourceType, gradeSelection, weekRange) => {
  const unAccessedResources = resourceData.filter(resource => resource.self_access_count === 0)
  const accessedResources = resourceData.filter(resource => resource.self_access_count >= 1)
  const narrativeTextResources = {}
  narrativeTextResources.weekRange = `Resources accessed from week ${weekRange[0]} to ${weekRange[1]}. `
  narrativeTextResources.resourceType = `Selected resource type(s) ${resourceType.length === 1 ? 'is' : 'are'} ${resourceType}. `
  narrativeTextResources.gradeFilter = gradeSelection.toUpperCase() !== 'ALL' ? `Filtering on grades ${gradeSelection}. ` : ''
  narrativeTextResources.resourcesUnaccessCount = `You have not yet accessed ${unAccessedResources.length} of ${resourceData.length} resources.  `
  narrativeTextResources.resourcesAccessCount = accessedResources.length !== 0 ? `. You have accessed ${accessedResources.length} of ${resourceData.length} resources.  ` : ''
  narrativeTextResources.resourcesUnAccessList = unAccessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students.`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students.`
  )
  narrativeTextResources.resourceAccessList = accessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`)
  return narrativeTextResources.weekRange.concat(narrativeTextResources.resourceType,
    narrativeTextResources.gradeFilter, narrativeTextResources.resourcesUnaccessCount,
    narrativeTextResources.resourcesUnAccessList, narrativeTextResources.resourcesAccessCount, narrativeTextResources.resourceAccessList)
}

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

  const narrTextGrades = []
  const courseStats = `Course information: Class size = ${gradesSummary.tot_students}, Average grade = ${gradesSummary.grade_avg}%, Median grade = ${gradesSummary.median_grade}%.`
  narrTextGrades.push(courseStats)
  narrTextGrades.push(isBinningUsed ? binningNarrativeText() : '')
  for (const gradeBin in bins) {
    if (bins[gradeBin].length > 0) {
      const binLowerLimit = bins[gradeBin].x0
      const binUpperLimit = bins[gradeBin].x1
      if (isInRange(myGrade, binLowerLimit, binUpperLimit) && myGrade) {
        narrTextGrades.push(`${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range, and your grade ${myGrade}% is in this range. `)
      } else {
        narrTextGrades.push(`${bins[gradeBin].length} grades are in the ${binLowerLimit} to ${binUpperLimit}% range. `)
      }
    }
  }
  console.log(narrTextGrades)
  // console.log(narrativeTextGrades)
  // const myData = [{ name: 'John', age: 37, height: 1.93 }, { name: 'Mafe', age: 36, height: 1.73 }, { name: 'Santi', age: 9, height: 1.2 }, { name: 'David', age: 3, height: 0.7 }, { name: 'Sonia', age: 73, height: 1.5 }]
  // return myData
  return narrTextGrades
  // return narrativeTextGrades
  // return narrativeTextGrades.courseStats.concat(narrativeTextGrades.binnedGradeText, narrativeTextGrades.courseGrades.toString())
}
export {
  createResourcesText,
  createGradesText
}
