import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  card: {
    width: 325,
    display: 'flex',
    margin: theme.spacing.unit * 1
  },
  media: {
    height: 140,
    backgroundSize: 'auto'
  },
  content: {
    height: 110,
    padding: 0
  },
  title: {
    boxSizing: 'border-box',
    padding: theme.spacing.unit * 1,
    color: 'white',
    marginBottom: 0,
    backgroundColor: theme.palette.primary.main
  },
  description: {
    padding: theme.spacing.unit * 1
  }
})

const SelectCard = props => {
  const { classes, cardData } = props

  return (
    <Card className={classes.card}>
      <CardActionArea>
        {
          cardData.image
            ? <CardMedia
              className={classes.media}
              image={cardData.image}
              title={cardData.title}
            />
            : null
        }
        <CardContent className={classes.content}>
          <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
            {cardData.title}
          </Typography>
          <Typography component='p' className={classes.description}>
            {cardData.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default withStyles(styles)(SelectCard)
