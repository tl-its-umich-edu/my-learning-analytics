import { useState, useEffect } from 'react'
import GoogleAnalytics from 'react-ga4'

function GoogleAnalyticsTracking (props) {
  const { gaId, cspNonce } = props

  const [initialized, setInitialized] = useState(false)
  const [previousPage, setPreviousPage] = useState(null)

  if (gaId && !initialized) {
    setInitialized(true)
    GoogleAnalytics.initialize([{
      trackingId: gaId,
      gaOptions: { nonce: cspNonce }
    }])
  }

  useEffect(() => {
    const page = window.location.pathname + window.location.search + window.location.hash
    if (gaId && page !== previousPage) {
      setPreviousPage(page)
      GoogleAnalytics.send({ hitType: 'pageview', page })
    }
  })

  return null
}

export default GoogleAnalyticsTracking
