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

const dateToMonthDay = date => {
  const dateObj = new Date(date)

  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()

  return `${month}/${day}`
}

export {
  calculateWeekOffset,
  dateToMonthDay
}
