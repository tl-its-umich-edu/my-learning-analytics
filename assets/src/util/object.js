const isObjectEmpty = obj => obj.constructor === Object && Object.entries(obj).length === 0


// could use Object.values but support isn't widespread yet
const getObjectValues = obj => Object.keys(obj).map(key => obj[key])

export {
  isObjectEmpty,
  getObjectValues
}
