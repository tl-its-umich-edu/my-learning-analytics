const handleError = res => {
  if (!res.ok) throw Error(res.statusText)
  return res
}

const defaultFetchOptions = {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
}
export {
  handleError,
  defaultFetchOptions
}