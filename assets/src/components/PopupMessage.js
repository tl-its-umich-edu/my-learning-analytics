import React from 'react'
import { Typography } from '@material-ui/core'

function PopupMessage ({ a, assignmentGroups }) {
  const getAssignmentRules = (a, assignmentGroups) => {
    const assignmenGroup = assignmentGroups.find(ag => ag.id === a.assignmentGroupId)
    return assignmenGroup
      ? (
        {
          dropLowest: assignmenGroup.dropLowest,
          dropHighest: assignmenGroup.dropHighest
        }
      )
      : false
  }

  const dropHighest = getAssignmentRules(a, assignmentGroups).dropHighest
  const dropLowest = getAssignmentRules(a, assignmentGroups).dropLowest

  let rulesMessage
  if (dropHighest !== 0 && dropLowest !== 0) {
    rulesMessage = `Both the highest ${dropHighest} scores and the lowest ${dropLowest} scores will be dropped from this assignment group`
  } else if (dropHighest !== 0) {
    rulesMessage = `The highest ${dropHighest} scores will be dropped from this assignment group`
  } else if (dropLowest !== 0) {
    rulesMessage = `The lowest ${dropLowest} scores will be dropped from this assignment group`
  } else {
    rulesMessage = 'There are no rules for this assignment'
  }

  if (!a.graded) {
    return (
      <Typography>
        <p>Rules: {rulesMessage}</p>
      </Typography>
    )
  } else {
    return (
      <Typography>
        <p>Previous goal(s)?</p>
        <p>Class Average: {a.averageGrade}</p>
        <p>Rules: {rulesMessage}</p>
      </Typography>
    )
  }
}

export default PopupMessage
