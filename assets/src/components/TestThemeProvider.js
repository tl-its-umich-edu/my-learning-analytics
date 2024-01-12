import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'

import { siteTheme } from '../globals'

function TestThemeProvider ({ children }) {
  return <ThemeProvider theme={siteTheme}>{children}</ThemeProvider>
}

export default TestThemeProvider
