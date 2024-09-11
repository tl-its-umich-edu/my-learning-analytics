import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import './index.css'
import App from './containers/App'
import client from './service/client'
import { ApolloProvider } from '@apollo/client'
import { user, siteTheme, gaId, cspNonce, oneTrustScriptDomain } from './globals'
// import * as serviceWorker from './serviceWorker'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <Router basename='/'>
    <ApolloProvider client={client}>
      <ThemeProvider theme={siteTheme}>
        <App user={user} gaId={gaId} cspNonce={cspNonce} oneTrustScriptDomain={oneTrustScriptDomain} />
      </ThemeProvider>
    </ApolloProvider>
  </Router>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister()
