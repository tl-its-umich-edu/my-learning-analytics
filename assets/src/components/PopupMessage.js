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
    rulesMessage = `Both the highest ${dropHighest} scores and lowest ${dropLowest} scores will be dropped from this assignment group`
  } else if (dropHighest !== 0) {
    rulesMessage = `The highest ${dropHighest} scores will be dropped from this assignment group`
  } else if (dropLowest !== 0) {
    rulesMessage = `The lowest ${dropLowest} scores will be dropped from this assignment group`
  } else {
    rulesMessage = 'There are no rules for this assignment'
  }

  let goalAndAverage
  if (a.graded) {
    goalAndAverage = (
      <div>
        <Typography>Previously set goal: <b>{a.goalGradeSetByUser ? a.goalGrade : 'None'}</b></Typography>
        <Typography>Class average: <b>{roundToXDecimals(a.averageGrade, 2)}</b></Typography>
      </div>
    )
  }

  return (
    <div>
      {goalAndAverage}
      <Typography>Rules: <b>{rulesMessage}</b></Typography>
    </div>
  )
}

export default PopupMessage
