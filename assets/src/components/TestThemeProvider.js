import * as React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'

import { siteTheme } from '../globals'

function TestThemeProvider ({ children }) {
  return <ThemeProvider theme={siteTheme}>{children}</ThemeProvider>
}

export default TestThemeProvider
