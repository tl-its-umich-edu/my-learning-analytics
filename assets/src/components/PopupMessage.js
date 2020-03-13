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

  if (dropHighest !== 0 && dropLowest !== 0) {
    return (
      <Typography>
        {
          `The highest ${dropHighest} scores will be dropped from this assignment group
              The lowest ${dropLowest} scores will be dropped from this assignment group`
        }
      </Typography>
    )
  }
  if (dropHighest !== 0) {
    return (
      <Typography>
        {
          `The highest ${dropHighest} scores will be dropped from this assignment group`
        }
      </Typography>
    )
  }
  if (dropLowest !== 0) {
    return (
      <Typography>
        {
          `The lowest ${dropLowest} scores will be dropped from this assignment group`
        }
      </Typography>
    )
  }
  return (
    <Typography>There are no rules for this assignment</Typography>
  )
}

export default PopupMessage
