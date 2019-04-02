const formatDate = date => {
  const d = new Date(date)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth() + 1]
  const day = d.getDate()
  const year = d.getFullYear()
  return month + ' ' + day + ', ' + year
}

export {
  formatDate
}
