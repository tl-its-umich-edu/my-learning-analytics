import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

/**
 * This is a workaround for the fact that React Router v6 no longer has a withRouter function.
 * See https://reactrouter.com/en/main/start/faq#what-happened-to-withrouter-i-need-it
 */

function withRouter (Component) {
  function ComponentWithRouterProp (props) {
    return (
      <Component
        {...props}
        location={useLocation()}
        params={useParams()}
        navigate={useNavigate()}
      />
    )
  }

  return ComponentWithRouterProp
}

export default withRouter
