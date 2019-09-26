/* global describe, it, expect */

import { calculateWeekOffset } from '../../util/date'

describe('calculateWeekOffset', () => {
  it('takes as input a date time string and returns the week of the year', () => {
    const jan1 = '2019-01-01T10:36:17+00:00'
    const jan6 = '2019-01-06T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan6)).toEqual(1)

    const jan7 = '2019-01-07T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan7)).toEqual(1)

    const jan8 = '2019-01-08T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan8)).toEqual(2)

    const jan14 = '2019-01-14T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan14)).toEqual(2)

    const jan15 = '2019-01-15T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan15)).toEqual(3)

    const jan16 = '2019-01-16T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, jan16)).toEqual(3)

    // const dec31 = '2019-12-31T10:36:17+00:00'
    // expect(calculateWeekOffset(jan1, dec31)).toEqual(52)
  })
})
