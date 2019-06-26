import React, { useState } from 'react'
import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CardContent from '@material-ui/core/CardContent'
import Popover from '@material-ui/core/Popover'

const styles = theme => ({
  card: {
    width: '100%'
  }
})

function DiscussionCard (props) {
  const { classes, keyword, coherence, children } = props

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  return (
    <>
      <Card
        className={classes.card}
        onClick={event => setAnchorEl(event.currentTarget)}>
        <CardContent
          style={{
            backgroundColor: coherence > 0.7
              ? '#2171b5'
              : coherence > 0.4
                ? '#6baed6'
                : coherence > 0.2
                  ? '#bdd7e7'
                  : '#eff3ff'
          }} >
          <Typography variant='h6' gutterBottom>
            {keyword}
          </Typography>
        </CardContent>
      </Card>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {children}
      </Popover>
    </>
  )
}

export default withStyles(styles)(DiscussionCard)
