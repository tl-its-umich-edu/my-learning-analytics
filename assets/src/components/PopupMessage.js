import React from 'react'
import { Typography } from '@material-ui/core'
import { roundToXDecimals } from '../util/math'

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
      <div>
        <Typography>Previously set goal: {a.goalGradeSetByUser ? a.goalGrade : 'None'}</Typography>
        <Typography>Class average: {roundToXDecimals(a.averageGrade, 2)}</Typography>
        <Typography>Rules: {rulesMessage}</Typography>
      </div>
    )
  }
}

export default PopupMessage
