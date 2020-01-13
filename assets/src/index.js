import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import './index.css'
import App from './containers/App'
import { user, siteTheme, gaId, loginURL } from './globals'
// import * as serviceWorker from './serviceWorker'


ReactDOM.render(
  <Router basename='/'>
    <ThemeProvider theme={siteTheme}>
      <App user={user} gaId={gaId} loginURL={loginURL} />
    </ThemeProvider>
  </Router>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister()
