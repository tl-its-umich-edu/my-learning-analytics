import { createMuiTheme } from '@material-ui/core/styles'
import defaultPalette from './defaultPalette'

// The fallback to an empty object is needed to not break tests using siteTheme.
const mylaGlobalsEl = document.getElementById('myla_globals')
const ltiGlobalsEl = document.getElementById('lti_globals')
const mylaGlobals = mylaGlobalsEl ? JSON.parse(mylaGlobalsEl.textContent) : {}
const LTIGlobals = ltiGlobalsEl ? JSON.parse(ltiGlobalsEl.textContent) : {}
console.log(LTIGlobals)

/*
Frozen to prevent unintentional changes to this object. This object is strictly readonly.
mylaGlobals should ONLY be accessed in globals.js, and nowhere else.
*/
const user = Object.freeze({
  username: LTIGlobals.username,
  admin: LTIGlobals.is_superuser,
  relatedCourses: LTIGlobals.user_courses_info,
  isSuperuser: LTIGlobals.is_superuser,
  isLoggedIn: !!LTIGlobals.username,
  loginURL: LTIGlobals.login,
  logoutURL: LTIGlobals.logout,
  helpURL: LTIGlobals.help_url,
  launchID: LTIGlobals.launch_id
})

const sitePalette = JSON.parse(JSON.stringify(defaultPalette))
// Don't update the palette if mylaGlobals.primary_ui_color is null or undefined
if (LTIGlobals.primary_ui_color != null) {
  sitePalette.primary.main = LTIGlobals.primary_ui_color
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

const siteTheme = createMuiTheme({
  palette: sitePalette,
  props: componentSettings
})
const gaId = mylaGlobals.google_analytics_id

export { user, siteTheme, gaId }
