/* global describe, it, expect */
import { getCurrentWeek } from '../../util/data'
import { assignmentData } from '../testData/assignmentViewTestData'

describe('getCurrentWeek', () => {
  it('returns true if current week is found', () => {
    expect(getCurrentWeek(assignmentData)).toEqual(4)
  })
})
