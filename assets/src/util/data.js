import Cookie from 'js-cookie'

const handleError = res => {
  if (!res.ok) {
      // Return the statusText or if it's empty just return the status
      // This is to preserve existing behavior where statusText was returned but isn't always available
      throw Error(res.statusText || res.status.toString())
  }
  return res
}

const defaultFetchOptions = {
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRFToken': Cookie.get('csrftoken')
  },
  credentials: 'include'
}

const getCurrentWeek = assignmentData => {
  const currentWeekObject = assignmentData
    .find(x => x.due_date_items[0].assignment_items[0].current_week)
  return currentWeekObject
    ? currentWeekObject.week
    : null
}

const loadedWithoutError = (loading, error) => !loading && !error

export {
  handleError,
  defaultFetchOptions,
  getCurrentWeek,
  loadedWithoutError
}
