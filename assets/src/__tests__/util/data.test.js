/* global describe, it, expect */

import { calculateAssignmentWeek } from '../../util/data'

describe('calculateAssignmentWeek', () => {
  it('takes an array of assignments with due dates and returns the week of the assignment', () => {
    const assignments = [
      {
        name: 'Random Assignment #349',
        dueDate: '2019-06-18T15:58:38+00:00',
        pointsPossible: 14
      },
      {
        name: 'Reading Assignment #158',
        dueDate: '2019-06-09T10:36:17+00:00',
        pointsPossible: 33
      },
      {
        name: 'Random Assignment #288',
        dueDate: '2019-06-02T06:03:19+00:00',
        pointsPossible: 22
      }
    ]

    const courseStartDate = new Date('2019-04-02 04:00:00.000000')
    const assignment1DueDate = new Date(assignments[0].dueDate)

    console.log(Math.abs(assignment1DueDate - courseStartDate) / (1000 * 60 * 60 * 24))
  })
})
