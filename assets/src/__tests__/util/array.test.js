/* global describe, it, expect */

import { flatten, getValues } from '../../util/array'

describe('flatten', () => {
  it('leaves a non-nested array as is', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('flattens an array of arrays by depth 1', () => {
    expect(flatten([[1], [2], [3]])).toEqual([1, 2, 3])
    expect(flatten([[1], [2], [3], 4])).toEqual([1, 2, 3, 4])
    expect(flatten([['hello'], ['there'], ['myla'], 4])).toEqual(['hello', 'there', 'myla', 4])
  })

  it('flattens only one depth', () => {
    expect(flatten([[[1]], [[2]], [[3]]])).toEqual([[1], [2], [3]])
  })
})

describe('getValues', () => {
  it('gets values from Objects', () => {
    const inputObj = {
      x: 'hello',
      y: 'there'
    }
    expect(getValues(inputObj)).toEqual(['hello', 'there'])
  })

  it('flattens one level deep if value is array', () => {
    const inputObj = {
      x: ['hello'],
      y: ['there']
    }
    expect(getValues(inputObj)).toEqual((['hello', 'there']))
  })
})
