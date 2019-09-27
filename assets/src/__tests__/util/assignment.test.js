/* global describe, it, expect */

import {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeightedAssignmentGrade
} from '../../util/assignment'

const assignments = [
  {
    week: 1,
    dueDate: '10/15',
    title: 'Attendance',
    graded: true,
    score: 1,
    outOf: 1,
    percentOfFinalGrade: 5
  },
  {
    week: 1,
    dueDate: '10/15',
    title: 'Group Project',
    graded: true,
    score: 90,
    outOf: 100,
    percentOfFinalGrade: 15
  },
  {
    week: 2,
    dueDate: '10/22',
    title: 'Attendance',
    graded: false,
    score: null,
    outOf: 1,
    percentOfFinalGrade: 10
  },
  {
    week: 2,
    dueDate: '10/24',
    title: 'Discussion',
    graded: false,
    score: null,
    outOf: 5,
    percentOfFinalGrade: 20
  },
  {
    week: 3,
    dueDate: '11/24',
    title: 'Final Exam',
    graded: false,
    score: null,
    outOf: 100,
    percentOfFinalGrade: 50
  }
]

describe('calculateAssignmentGradeFromCourseGrade', () => {
  it(`takes an array of assignments and a course goal as input,
    and returns a new array of assignments with the goalGrade for each assignment set,
    such that the course grade is achieved.
  `, () => {
    const result = [

    ]
    expect(calculateAssignmentGoalsFromCourseGoal(assignments, 70))
  })
})

describe('calculateWeightedAssignmentGrade', () => {
  it('takes an assignment and an array of assignment Groups and calculates the weighted assignment grade', () => {
    const assignment = {
      name: 'Random Assignment #349',
      dueDate: '2019-06-18T15:58:38+00:00',
      pointsPossible: 14,
      averageGrade: 28.29705882352941,
      assignmentGroupId: '17700000000448862'
    }

    const assignmentGroups = [
      {
        weight: 17,
        id: '17700000000400251',
        groupPoints: 100
      },
      {
        weight: 5,
        id: '17700000000448862',
        groupPoints: 50
      },
      {
        weight: 15,
        id: '17700000000900838',
        groupPoints: 30
      }
    ]

    expect(calculateWeightedAssignmentGrade(assignment, assignmentGroups)).toEqual(1.4)
  })
})
