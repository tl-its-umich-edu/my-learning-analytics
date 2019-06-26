import React from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

function DiscussionSentenceList (props) {
  const { usage, coherence } = props

  if (usage.length === 0) return null

  const bull = <span>•</span>

  return (
    <Card>
      <CardContent>
        <Typography color='textSecondary' variant='h6' gutterBottom>
          Coherence: {coherence}
        </Typography>
        {
          usage.map((sentence, i) => (
            <Typography variant='h6' key={i}>{bull} {sentence}</Typography>
          ))
        }
      </CardContent>
    </Card>
  )
}

export default DiscussionSentenceList
