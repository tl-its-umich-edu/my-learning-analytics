/* global describe, it, expect */

import { isObjectEmpty, getObjectValues } from '../../util/object'

describe('isObjectEmpty', () => {
  it('returns true if object is empty', () => {
    expect(isObjectEmpty({})).toEqual(true)
  })

  it('returns false if object is not empty', () => {
    expect(isObjectEmpty({ a: 'b' })).toEqual(false)
  })
})

describe('getObjectValues', () => {
  it('returns an array of values from the object', () => {
    expect(getObjectValues({ a: 'hello', b: 'there' })).toEqual(['hello', 'there'])
    expect(getObjectValues({ a: 1, b: 2 })).toEqual([1, 2])
  })

  it('returns an empty array if object is empty', () => {
    expect(getObjectValues({})).toEqual([])
  })
})
