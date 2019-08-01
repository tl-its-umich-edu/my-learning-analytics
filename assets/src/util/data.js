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

export {
  handleError,
  defaultFetchOptions
}
