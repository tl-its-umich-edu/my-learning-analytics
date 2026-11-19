/* global describe, it, expect, jest */
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { getCurrentWeek } from '../../util/data'
import useInitAssignmentState from '../../hooks/useInitAssignmentState'
import { assignmentData } from '../testData/assignmentViewTestData'

describe('getCurrentWeek', () => {
  it('returns true if current week is found', () => {
    expect(getCurrentWeek(assignmentData)).toEqual(4)
  })
})

describe('useInitAssignmentState', () => {
  it.each([
    [false, 90],
    [true, 95]
  ])('initializes grades from enriched assignments (weighted: %s)', async (weighted, expectedMax) => {
    const assignments = Object.freeze([
      Object.freeze({
        id: 'graded',
        name: 'Graded',
        dueDate: null,
        pointsPossible: 100,
        assignmentGroupId: 'graded-group',
        assignmentGroup: Object.freeze({ name: 'Graded' }),
        currentUserSubmission: Object.freeze({ score: 80, gradedDate: '2025-01-08', submittedAt: '2025-01-07' })
      }),
      Object.freeze({
        id: 'ungraded',
        name: 'Ungraded',
        dueDate: null,
        pointsPossible: 100,
        assignmentGroupId: 'ungraded-group',
        assignmentGroup: Object.freeze({ name: 'Ungraded' }),
        currentUserSubmission: null
      })
    ])
    const assignmentGroups = [
      { id: 'graded-group', groupPoints: 100, weight: 25 },
      { id: 'ungraded-group', groupPoints: 100, weight: 75 }
    ]
    const data = {
      course: {
        assignments,
        assignmentGroups,
        dateStart: '2025-01-01',
        assignmentWeightConsideration: weighted,
        currentUserDefaultSelection: null
      }
    }
    const setAssignments = jest.fn()
    const setUserSetting = jest.fn()
    const container = document.createElement('div')
    const root = createRoot(container)

    function TestInitializer () {
      const [, currentGrade, maxPossibleGrade] = useInitAssignmentState({
        loading: false,
        error: undefined,
        data,
        setAssignments,
        setUserSetting
      })
      return <span>{currentGrade} / {maxPossibleGrade}</span>
    }

    try {
      await act(async () => root.render(<TestInitializer />))
      expect(container.textContent).toBe(`80 / ${expectedMax}`)
      expect(setAssignments).toHaveBeenCalledTimes(1)
      const enriched = setAssignments.mock.calls[0][0]
      expect(enriched).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'graded', graded: true }),
        expect.objectContaining({ id: 'ungraded', graded: false })
      ]))
      expect(enriched[0]).not.toBe(assignments[0])
      expect(assignments[0]).not.toHaveProperty('graded')
      expect(assignments[1]).not.toHaveProperty('graded')
    } finally {
      await act(async () => root.unmount())
    }
  })
})
