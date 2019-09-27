import Cookie from 'js-cookie'

const handleError = res => {
  if (!res.ok) throw Error(res.statusText)
  return res
}

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
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

export {
  handleError,
  defaultFetchOptions,
  getCurrentWeek
}
