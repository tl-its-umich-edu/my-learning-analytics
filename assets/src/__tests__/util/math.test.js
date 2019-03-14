import { average } from '../../util/math'

describe('average', () => {
  it('takes an array of numbers and calculates average', () => {
    expect(average([1,2,3,4,5])).toEqual(3)
  })
})
