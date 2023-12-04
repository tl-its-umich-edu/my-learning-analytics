import React from 'react'
import PropTypes from 'prop-types'
import withStyles from '@mui/styles/withStyles'
import { Card, CardContent, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: 'flex'
  },
  container: {
    display: 'flex',
    justifyContent: 'center'
  },
  grow: {
    flexGrow: 1
  },
  card: {
    margin: theme.spacing(3)
  },
  content: {
    height: 110,
    padding: 0
  },
  title: {
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    color: 'white',
    marginBottom: 0,
    backgroundColor: theme.palette.primary.main
  },
  description: {
    padding: theme.spacing(1),
    color: 'black'
  }
})

const CourseListCard = (props) => {
  const { classes } = props

  return (
    <Card className={classes.card} elevation={2}>
      <Link tabIndex={-1} style={{ textDecoration: 'none' }} to={props.path}>
        <CardContent className={classes.content}>
          <Typography gutterBottom variant='h5' component='h4' className={classes.title}>
            {props.courseName}
          </Typography>
          <Typography component='p' className={classes.description}>
            {props.description}
          </Typography>
        </CardContent>
      </Link>
    </Card>
  )
}

CourseListCard.propTypes = {
  path: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
  description: PropTypes.string
}

CourseListCard.defaultProps = {}

export default withStyles(styles)(CourseListCard)
