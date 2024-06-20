import { createTheme } from '@mui/material/styles'
import defaultPalette from './defaultPalette'

// The fallback to an empty object is needed to not break tests using siteTheme.
const mylaGlobalsEl = document.getElementById('myla_globals')
const mylaGlobals = mylaGlobalsEl ? JSON.parse(mylaGlobalsEl.textContent) : {}

let cspNonce
const cspMetaEl = document.querySelector('meta[name="csp-nonce"]')
if (cspMetaEl !== null && cspMetaEl.hasAttribute('content')) {
  cspNonce = cspMetaEl.getAttribute('content')
}

/*
Frozen to prevent unintentional changes to this object. This object is strictly readonly.
mylaGlobals should ONLY be accessed in globals.js, and nowhere else.
*/
const user = Object.freeze({
  username: mylaGlobals.username,
  displayName: mylaGlobals.display_name,
  initials: mylaGlobals.initials,
  admin: mylaGlobals.is_superuser,
  relatedCourses: mylaGlobals.user_courses_info,
  isSuperuser: mylaGlobals.is_superuser,
  isLoggedIn: !!mylaGlobals.username,
  loginURL: mylaGlobals.login,
  logoutURL: mylaGlobals.logout,
  LTIlaunchID: mylaGlobals.lti_launch_id,
  LTIIsCourseDataLoaded: mylaGlobals.lti_is_course_data_loaded
})

const viewHelpURLs = Object.freeze(mylaGlobals.view_help_urls)

const surveyLink = Object.freeze(mylaGlobals.survey_link)

const sitePalette = JSON.parse(JSON.stringify(defaultPalette))
// Don't update the palette if mylaGlobals.primary_ui_color is null or undefined
if (mylaGlobals.primary_ui_color != null) {
  sitePalette.primary.main = mylaGlobals.primary_ui_color
}

// Variant mapping: https://material-ui.com/components/typography/#changing-the-semantic-element
// This will make uses of h5 appear as h1 and h6 appear as h2, without changing styling.
const componentSettings = {
  MuiTypography: {
    variantMapping: {
      h5: 'h1',
      h6: 'h2'
    }
  }
}

const siteTheme = createTheme({
  palette: sitePalette,
  props: componentSettings
})
const gaId = mylaGlobals.google_analytics_id

export { user, siteTheme, gaId, cspNonce, viewHelpURLs, surveyLink }
