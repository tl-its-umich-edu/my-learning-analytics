/* global describe, it, expect */

import {
  calculateAssignmentGoalsFromCourseGoal,
  calculateWeight,
  calculateCurrentGrade,
  calculateMaxGrade,
  sumAssignmentGoalGrade,
  createUserSettings
} from '../../util/assignment'

describe('calculateAssignmentGradeFromCourseGrade', () => {
  it(`takes an array of assignments and a course goal as input,
    and returns a new array of assignments with the goalGrade for each assignment set,
    such that the course grade is achieved.
  `, () => {
    const assignments = [
      {
        pointsPossible: 100,
        assignmentGroupId: '17700000000320046',
        currentUserSubmission: {
          score: 80
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      }
    ]
    const assignmentGroups = [
      {
        weight: 50,
        id: '17700000000320046',
        groupPoints: 100
      },
      {
        weight: 50,
        id: '17700000000320044',
        groupPoints: 80
      }
    ]
    const result = [
      {
        pointsPossible: 100,
        assignmentGroupId: '17700000000320046',
        currentUserSubmission: {
          score: 80
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      }
    ]
    expect(calculateAssignmentGoalsFromCourseGoal(90, assignments, assignmentGroups, true)).toEqual(result)
  })
})

describe('calculateWeightedAssignmentGrade', () => {
  it('takes an assignment and an array of assignment Groups and calculates the weighted assignment grade', () => {
    const assignment1 = {
      name: 'Random Assignment #349',
      dueDate: '2019-06-18T15:58:38+00:00',
      pointsPossible: 14,
      averageGrade: 28.29705882352941,
      assignmentGroupId: '17700000000448862'
    }

    const assignment2 = {
      name: 'Information Assignment #607',
      dueDate: '2019-05-16T18:42:35+00:00',
      pointsPossible: 29,
      averageGrade: 2.611764705882352,
      assignmentGroupId: '17700000000400251'
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

    expect(
      calculateWeight(assignment1.pointsPossible, assignment1.assignmentGroupId, assignmentGroups)
    ).toEqual(5 * (14 / 50))
    expect(
      calculateWeight(assignment2.pointsPossible, assignment2.assignmentGroupId, assignmentGroups)
    ).toEqual(17 * (29 / 100))
  })
})

describe('calculateCurrentGrade', () => {
  it('takes assignments and assignmentGroups and returns the course grade of the student', () => {
    const assignments1 = [
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 40
        },
        graded: true
      }
    ]

    const assignmentGroups = [
      {
        weight: 14,
        id: '17700000000320044',
        groupPoints: 80
      }
    ]

    expect(calculateCurrentGrade(assignments1, assignmentGroups, true)).toEqual(100)

    const assignments2 = [
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 20
        },
        graded: true
      }
    ]
    expect(calculateCurrentGrade(assignments2, assignmentGroups, true)).toEqual(50)

    const assignments3 = [
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 20
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 20
        },
        graded: true
      }
    ]
    expect(calculateCurrentGrade(assignments3, assignmentGroups, true)).toEqual(50)

    const assignments4 = [
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 20
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 40
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      }
    ]
    expect(calculateCurrentGrade(assignments4, assignmentGroups, true)).toEqual(75)
  })
})

describe('calculateMaxGrade', () => {
  it('takes assignments and assignmentGroups and calculates the max possible grade achievable', () => {
    const assignmentGroups = [
      {
        weight: 100,
        id: '17700000000320044',
        groupPoints: 120
      }
    ]

    const assignments = [
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 20
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 40
        },
        graded: true
      },
      {
        pointsPossible: 40,
        assignmentGroupId: '17700000000320044',
        currentUserSubmission: {
          score: 0
        },
        graded: false
      }
    ]
    expect(calculateMaxGrade(assignments, assignmentGroups, true)).toEqual(83.33333333333333)
  })
})

describe('sumAssignmentGoalGrade', () => {
  it('sums the assignment goal grade set by the user', () => {
    const assignments = [
      {
        goalGrade: null
      },
      {
        goalGrade: 65
      },
      {
        goalGrade: 100
      }
    ]
    expect(sumAssignmentGoalGrade(assignments)).toEqual(165)
  })
})

describe('createUserSettings', () => {
  it('takes goalGrade, courseId, and assignments as input and returns a GraphQL mutation object', () => {
    const courseId = '123456'
    const viewName = 'assignment'
    const setting = [
      {
        id: 'abcd1234',
        goalGradeSetByUser: false,
        goalGrade: 90
      },
      {
        id: '12345678',
        goalGradeSetByUser: true,
        goalGrade: 90
      },
      {
        id: '1234abcd',
        goalGradeSetByUser: false,
        goalGrade: 90
      }
    ]

    const output = {
      variables: {
        input: {
          canvasCourseId: courseId,
          defaultViewType: viewName,
          defaultViewValue: JSON.stringify(setting)
        }
      }
    }

    expect(createUserSettings(courseId, viewName, setting)).toEqual(output)
  })
})
