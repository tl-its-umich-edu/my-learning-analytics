import React from 'react'
import Popover from '@material-ui/core/Popover'
import { Typography } from '@material-ui/core'

function AssignmentTablePopover (props) {
  const { classes, assignmentGroups, a, anchorEl, setAnchorEl } = props

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

  return (
    <Popover
      className={classes.popover}
      classes={{ paper: classes.paper }}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      disableRestoreFocus
    >
      {
        getAssignmentRules(a, assignmentGroups).dropHighest !== 0
          ? (
            <Typography>
              {
                `The highest ${getAssignmentRules(a, assignmentGroups).dropHighest}
                                    scores will be dropped from this assignment group
                                  `
              }
            </Typography>
          ) : null
      }
      {
        getAssignmentRules(a, assignmentGroups).dropLowest !== 0
          ? (
            <Typography>
              {
                `The lowest ${getAssignmentRules(a, assignmentGroups).dropLowest}
                                    scores will be dropped from this assignment group
                                  `
              }
            </Typography>
          ) : null
      }
      {
        getAssignmentRules(a, assignmentGroups).dropHighest === 0 &&
          getAssignmentRules(a, assignmentGroups).dropLowest === 0
          ? <Typography>There are no rules for this assignment</Typography>
          : null
      }
    </Popover>
  )
}

export default AssignmentTablePopover
