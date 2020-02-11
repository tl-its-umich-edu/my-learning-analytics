import { createMuiTheme } from '@material-ui/core/styles'
import defaultPalette from './defaultPalette'

// The fallback to an empty object is needed to not break tests using siteTheme.
const mylaGlobalsEl = document.getElementById('myla_globals')
const mylaGlobals = mylaGlobalsEl ? JSON.parse(mylaGlobalsEl.textContent) : {}

/*
Frozen to prevent unintentional changes to this object. This object is strictly readonly.
mylaGlobals should ONLY be accessed in globals.js, and nowhere else.
*/
const user = Object.freeze({
  username: mylaGlobals.username,
  admin: mylaGlobals.is_superuser,
  relatedCourses: mylaGlobals.user_courses_info,
  isSuperuser: mylaGlobals.is_superuser,
  isLoggedIn: !!mylaGlobals.username,
  helpURL: mylaGlobals.help_url
})

const palette = JSON.parse(JSON.stringify(defaultPalette))
// Don't update the palette if mylaGlobals.primary_ui_color is null or undefined
if (mylaGlobals.primary_ui_color != null) {
  palette.primary.main = mylaGlobals.primary_ui_color
}

const siteTheme = createMuiTheme({ palette })
const gaId = mylaGlobals.google_analytics_id
const loginURL = mylaGlobals.login

export { user, siteTheme, gaId, loginURL }
