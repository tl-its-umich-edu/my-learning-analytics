import { useState, useEffect } from 'react'
import GoogleAnalytics from 'react-ga'

function GoogleAnalyticsTracking (props) {
  const {
    gaId
  } = props

  const [initialized, setInitialized] = useState(false)
  const [previousPage, setPreviousPage] = useState(null)

  if (gaId && !initialized) {
    setInitialized(true)
    GoogleAnalytics.initialize(gaId)
  }

  useEffect(() => {
    const page = window.location.pathname + window.location.search + window.location.hash
    if (gaId && page !== previousPage) {
      setPreviousPage(page)
      GoogleAnalytics.pageview(page)
    }
  })

  return null
}

export default GoogleAnalyticsTracking
