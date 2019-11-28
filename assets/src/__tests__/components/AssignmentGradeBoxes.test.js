/* global it, expect */

import React from 'react'
import AssignmentGradeBoxes from '../../components/AssignmentGradeBoxes'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <AssignmentGradeBoxes
        currentGrade={85}
        goalGrade={90}
        maxPossibleGrade={95}
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
