import React from 'react'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

function DiscussionSentenceList (props) {
  const { usage } = props

  if (usage.length === 0) return null

  return (
    <Paper>
      {
        usage.map((sentence, i) => (
          <Typography variant='h6' key={i}>{sentence}</Typography>
        ))
      }
    </Paper>
  )
}

export default DiscussionSentenceList
