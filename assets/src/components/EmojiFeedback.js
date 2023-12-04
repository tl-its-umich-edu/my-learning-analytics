import React, { useEffect, memo } from 'react'
import emojiFeedback from '@justin0022/emoji-feedback'
import withStyles from '@mui/styles/withStyles'
import withPopover from './withPopover'
import compose from '../util/compose'

const styles = ({
  feedback: {
    width: '310px',
    height: '350px',
    padding: '12px'
  }
})

const EmojiFeedback = memo(props => {
  const {
    endpoints,
    id,
    options,
    classes
  } = props

  useEffect(() => {
    const feedback = emojiFeedback()
    feedback.init(id, endpoints, options)
  })

  return (
    <div id={id} className={classes.feedback} />
  )
})

export default compose(
  withStyles(styles),
  withPopover
)(EmojiFeedback)
