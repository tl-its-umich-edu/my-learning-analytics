/* global describe, it, expect */

import { average } from '../../util/math'

describe('average', () => {
  it('returns NaN if array is empty', () => {
    expect(isNaN(average([]))).toBe(true)
  })

  it('takes an array of numbers and calculates average', () => {
    expect(average([1, 2, 3, 4, 5])).toEqual(3)
  })

  it('works with negative numbers', () => {
    expect(average([1, 2, -1, -2])).toEqual(0)
  })
})
