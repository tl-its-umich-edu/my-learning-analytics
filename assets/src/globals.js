import defaultPalette from './defaultPalette'
import { createMuiTheme } from '@material-ui/core/styles'

const mylaGlobals = JSON.parse(document.getElementById('myla_globals').textContent)

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

const palette = Object.assign({}, defaultPalette)
if (mylaGlobals.primary_ui_color !== null) {
  palette.primary.main = mylaGlobals.primary_ui_color
}

const siteTheme = createMuiTheme({ palette })
const gaId = mylaGlobals.google_analytics_id
const loginURL = mylaGlobals.login

export { user, siteTheme, gaId, loginURL }
