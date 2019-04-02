/* global describe, it, expect */

import * as math from '../../util/math'

describe('roundToOneDecimal', () => {
  it('takes a number and returns a number rounded to one decimal place', () => {
    expect(math.roundToOneDecimcal(0)).toEqual(0)
    expect(math.roundToOneDecimcal(10.1)).toEqual(10.1)
    expect(math.roundToOneDecimcal(10.11)).toEqual(10.1)
    expect(math.roundToOneDecimcal(10.15)).toEqual(10.2)
    expect(math.roundToOneDecimcal(10.16)).toEqual(10.2)
  })
})

describe('roundToTwoDecimal', () => {
  it('takes a number and returns a number rounded to two decimal places', () => {
    expect(math.roundToTwoDecimal(0)).toEqual(0)
    expect(math.roundToTwoDecimal(10.15)).toEqual(10.15)
    expect(math.roundToTwoDecimal(10.11)).toEqual(10.11)
    expect(math.roundToTwoDecimal(10.155)).toEqual(10.15)
    expect(math.roundToTwoDecimal(10.156)).toEqual(10.16)
  })
})

describe('average', () => {
  it('takes an array of numbers and calculates average', () => {
    expect(math.average([])).toEqual(null)
    expect(math.average([1])).toEqual(1)
    expect(math.average([1, 2, 3, 4, 5])).toEqual(3)
  })
})
