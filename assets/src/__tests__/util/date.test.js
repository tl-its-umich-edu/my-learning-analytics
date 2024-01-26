/* global describe, it, expect */

import { calculateWeekOffset, dateToMonthDay } from '../../util/date'

describe('calculateWeekOffset', () => {
  it('takes as input a date time string and returns the week of the year', () => {
    const jan1 = '2019-01-01T10:36:17+00:00'
    const jan13 = '2019-01-13T10:36:17+00:00'
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

    const dec31 = '2019-12-31T10:36:17+00:00'
    expect(calculateWeekOffset(jan1, dec31)).toEqual(53)

    expect(calculateWeekOffset(jan7, jan8)).toEqual(1)
    expect(calculateWeekOffset(jan7, jan13)).toEqual(1)
    expect(calculateWeekOffset(jan7, jan14)).toEqual(2)
    expect(calculateWeekOffset(jan7, jan15)).toEqual(2)
  })
})

describe('dateToMonthDay', () => {
  it('takes as input a date time string and returns in {month}/{day} format', () => {
    const date = '2019-05-16T18:42:35+00:00'
    expect(dateToMonthDay(date)).toEqual('5/16')

    const date2 = '2019-06-02T06:03:19+00:00'
    expect(dateToMonthDay(date2)).toEqual('6/2')

    const date3 = '2019-12-02T23:59:59-04:00'
    expect(dateToMonthDay(date3)).toEqual('12/2')
  })
})
