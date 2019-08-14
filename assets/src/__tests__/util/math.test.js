/* global describe, it, expect */

import {
  average,
  roundToOneDecimal,
  roundToTwoDecimal,
  median,
  pearsonCorrelation
} from '../../util/math'

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

  it('can handle decimals', () => {
    expect(average([1, 2])).toEqual(1.5)
  })
})

describe('median', () => {
  it('takes an array of numbers and returns the median', () => {
    expect(median([1])).toBe(1)
    expect(median([1, 2, 3])).toBe(2)
    expect(median([3, 2, 1])).toBe(2)
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
})

describe('roundToOneDecimal', () => {
  it('takes a rational number and returns that number rounded to one decimal place', () => {
    expect(roundToOneDecimal(1)).toBe(1)
    expect(roundToOneDecimal(1.5)).toBe(1.5)
    expect(roundToOneDecimal(1.55)).toBe(1.6)
    expect(roundToOneDecimal(1.555)).toBe(1.6)
    expect(roundToOneDecimal(1.32)).toBe(1.3)
  })
})

describe('roundToTwoDecimal', () => {
  it('takes a rational number and returns that number rounded to two decimal place', () => {
    expect(roundToTwoDecimal(1)).toBe(1)
    expect(roundToTwoDecimal(1.5)).toBe(1.5)
    expect(roundToTwoDecimal(1.55)).toBe(1.55)
    expect(roundToTwoDecimal(1.551)).toBe(1.55)
    expect(roundToTwoDecimal(1.555)).toBe(1.56)
    expect(roundToTwoDecimal(1.32)).toBe(1.32)
  })
})
