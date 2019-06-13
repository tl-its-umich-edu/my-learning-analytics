import React from 'react'
import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  card: {
    width: '100%'
  }
})

function SimpleCard (props) {
  const { classes, keyword } = props
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          {keyword}
        </Typography>
        <CardActions>
          <Button size='small'>See Instances</Button>
        </CardActions>
      </CardContent>
    </Card>
  )
}

export default withStyles(styles)(SimpleCard)
