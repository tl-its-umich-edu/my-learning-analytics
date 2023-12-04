import * as React from 'react'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'

import { siteTheme } from '../globals'

function TestThemeProvider ({ children }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={siteTheme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  )
}

export default TestThemeProvider
