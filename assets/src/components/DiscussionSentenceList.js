import React from 'react'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

function DiscussionSentenceList (props) {
  const { discussion, keyword } = props

  if (!discussion[keyword]) return null

  return (
    <Paper>
      {
        discussion[keyword]
          .map((sentence, i) => (
            <Typography variant='h6' key={i}>{sentence}</Typography>
          ))
      }
    </Paper>
  )
}

export default DiscussionSentenceList
