import React from 'react'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import { Card, CardContent, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const PREFIX = 'CourseListCard'

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
  container: `${PREFIX}-container`,
  grow: `${PREFIX}-grow`,
  card: `${PREFIX}-card`,
  content: `${PREFIX}-content`,
  title: `${PREFIX}-title`,
  description: `${PREFIX}-description`
}

const StyledCard = styled(Card)((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    flexGrow: 1
  },

  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    display: 'flex'
  },

  [`& .${classes.container}`]: {
    display: 'flex',
    justifyContent: 'center'
  },

  [`& .${classes.grow}`]: {
    flexGrow: 1
  },

  [`&.${classes.card}`]: {
    margin: theme.spacing(3)
  },

  [`& .${classes.content}`]: {
    height: 110,
    padding: 0
  },

  [`& .${classes.title}`]: {
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    color: 'white',
    marginBottom: 0,
    backgroundColor: theme.palette.primary.main
  },

  [`& .${classes.description}`]: {
    padding: theme.spacing(1),
    color: 'black'
  }
}))

const CourseListCard = (props) => {
  return (
    <StyledCard className={classes.card} elevation={2}>
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
    </StyledCard>
  )
}

CourseListCard.propTypes = {
  path: PropTypes.string.isRequired,
  courseName: PropTypes.string.isRequired,
  description: PropTypes.string
}

CourseListCard.defaultProps = {}

export default (CourseListCard)
