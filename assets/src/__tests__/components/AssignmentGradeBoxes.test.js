/* global it, expect */

import React from 'react'
import AssignmentGoalInput from '../../components/AssignmentGoalInput'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <AssignmentGoalInput
        currentGrade={85}
        goalGrade={90}
        maxPossibleGrade={95}
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
