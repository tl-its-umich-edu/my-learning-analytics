import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import './index.css'
import App from './containers/App'
import client from './service/client'
import { ApolloProvider } from '@apollo/client'
import { user, siteTheme, gaId, cspNonce } from './globals'
// import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <Router basename='/'>
    <ApolloProvider client={client}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={siteTheme}>
          <App user={user} gaId={gaId} cspNonce={cspNonce} />
        </ThemeProvider>
      </StyledEngineProvider>
    </ApolloProvider>
  </Router>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister()
