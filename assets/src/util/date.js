const calculateWeekOffset = (startDateTime, targetDateTime) => {
  if (!targetDateTime) {
    return null
  }

  const secondsInADay = 1000 * 60 * 60 * 24

  const startDate = new Date(startDateTime)
  const targetDate = new Date(targetDateTime)

  const differenceInDays = (targetDate - startDate) / secondsInADay
  return Math.ceil((differenceInDays + 1) / 7)
}

// Return date as a formatted "month/day" string
// eg. 2022-06-23T23:59:00 to 6/23
const dateToMonthDay = date => {
  const [, month, day] = date.split('T')[0].split('-')

  return `${Number(month)}/${Number(day)}`
}

export {
  calculateWeekOffset,
  dateToMonthDay
}
