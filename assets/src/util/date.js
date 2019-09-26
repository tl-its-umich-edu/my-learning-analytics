const calculateWeekOffset = (startDateTime, targetDateTime) => {
  const secondsInADay = 1000 * 60 * 60 * 24

  const startDate = new Date(startDateTime)
  const targetDate = new Date(targetDateTime)

  const differenceInDays = (targetDate - startDate) / secondsInADay
  return Math.ceil((differenceInDays + 1) / 7)
}

export {
  calculateWeekOffset
}
