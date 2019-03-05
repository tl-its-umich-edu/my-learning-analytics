const flatten = arr => arr.reduce((acc, cur) =>
  Array.isArray(cur)
    ? [...acc, ...cur]
    : [...acc, cur]
, [])

const getValues = obj => flatten(
  Object.values(obj)
)

export {
  flatten,
  getValues
}
