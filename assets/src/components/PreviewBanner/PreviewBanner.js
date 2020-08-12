import React from 'react'
import PropTypes from 'prop-types'
import AlertBanner from '../AlertBanner'

const PreviewBanner = props => {
  const { isDisabled } = props

  if (isDisabled) {
    return (<AlertBanner>Preview Mode: This view is currently disabled for students.</AlertBanner>)
  } else {
    return null
  }
}

PreviewBanner.propTypes = {
  isDisabled: PropTypes.bool.isRequired
}

PreviewBanner.defaultProps = {}

export default PreviewBanner
