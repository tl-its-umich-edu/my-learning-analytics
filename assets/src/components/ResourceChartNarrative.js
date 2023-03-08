import React from 'react'

function ResourceChartNarrative ({ data, weekRange, gradeSelection, resourceType }) {
  const resourceData = data.sort((a, b) => b.total_percent - a.total_percent)
  const unAccessedResources = resourceData.filter(resource => resource.self_access_count === 0)
  const accessedResources = resourceData.filter(resource => resource.self_access_count >= 1)
  const narrativeTextResources = {}
  narrativeTextResources.weekSelection = `Resources accessed from week ${weekRange[0]} to ${weekRange[1]}. `
  narrativeTextResources.typeOfResource = `Selected resource type(s) ${resourceType.length === 1 ? 'is' : 'are'} ${resourceType}. `
  narrativeTextResources.gradeFilter = gradeSelection.toUpperCase() !== 'ALL' ? `Filtering on grades ${gradeSelection}. ` : 'Getting resources across all grades.'
  narrativeTextResources.resourcesUnaccessCount = `You have not yet accessed ${unAccessedResources.length} of ${resourceData.length} resources.  `
  narrativeTextResources.resourcesAccessCount = accessedResources.length !== 0 ? `. You have accessed ${accessedResources.length} of ${resourceData.length} resources.  ` : ''
  narrativeTextResources.resourcesUnAccessList = unAccessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students.`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students.`
  )
  narrativeTextResources.resourceAccessList = accessedResources.map(x =>
    resourceType.length === 1
      ? `${x.resource_name.split('|')[1]} has been accessed by ${x.total_percent}% of students and you accessed ${x.self_access_count} times. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`
      : `${x.resource_name.split('|')[1]} of type ${x.resource_type} has been accessed by ${x.total_percent}% of students and you accessed ${x.self_access_count} times. The last time you accessed this resource was on ${new Date(x.self_access_last_time).toDateString()}`)
  return (
    <div id='resource-view-narrative' className='fa-sr-only' aria-live='polite'>
      <p>The following paragraphs provide a text description for the graphical bar-chart on this page:</p>
      <p>{narrativeTextResources.weekSelection}</p>
      <p>{narrativeTextResources.typeOfResource}</p>
      <p>{narrativeTextResources.gradeFilter}</p>
      <p aria-labelledby='unaccessedResources'>'List of unaccessed resources'</p>
      <ul id='unaccessedResources'>
        {narrativeTextResources.resourcesUnAccessList.map((item, key) => <li key={key}>{item}</li>)}
      </ul>
      <p aria-labelledby='accessedResources'>'List of accessed resources'</p>
      <ul id='accessedResources'>
        {narrativeTextResources.resourceAccessList.map((item, key) => <li key={key}>{item}</li>)}
      </ul>
    </div>
  )
}

export default ResourceChartNarrative
