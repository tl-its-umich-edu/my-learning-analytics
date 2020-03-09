/* global describe, it, expect */

import {
  average,
  roundToXDecimals,
  median
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

describe('roundToXDecimals', () => {
  it('takes a rational number and returns that number rounded to x decimal places', () => {
    // Rounding to tenths
    expect(roundToXDecimals(1, 1)).toBe(1)
    expect(roundToXDecimals(1.5, 1)).toBe(1.5)
    expect(roundToXDecimals(1.55, 1)).toBe(1.6)
    expect(roundToXDecimals(1.555, 1)).toBe(1.6)
    expect(roundToXDecimals(1.32, 1)).toBe(1.3)
    // Rounding to hundredths
    expect(roundToXDecimals(1, 2)).toBe(1)
    expect(roundToXDecimals(1.5, 2)).toBe(1.5)
    expect(roundToXDecimals(1.55, 2)).toBe(1.55)
    expect(roundToXDecimals(1.551, 2)).toBe(1.55)
    expect(roundToXDecimals(1.555, 2)).toBe(1.56)
    expect(roundToXDecimals(1.32, 2)).toBe(1.32)
    // Rounding to thousandths
    expect(roundToXDecimals(1, 3)).toBe(1)
    expect(roundToXDecimals(1.5, 3)).toBe(1.5)
    expect(roundToXDecimals(1.55, 3)).toBe(1.55)
    expect(roundToXDecimals(1.551, 3)).toBe(1.551)
    expect(roundToXDecimals(1.5555, 3)).toBe(1.556)
    expect(roundToXDecimals(1.5554, 3)).toBe(1.555)
  })
})
