/* global it, expect */

import { act } from 'react'
import AssignmentGoalInput from '../../components/AssignmentGoalInput'
import renderer from 'react-test-renderer'

it('renders correctly', async () => {
  let component
  await act(async () => {
    component = renderer.create(
      <AssignmentGoalInput
        currentGrade={85}
        goalGrade={90}
        maxPossibleGrade={95}
      />
    )
  })
  const tree = component.toJSON()

  expect(tree).not.toBeNull()
  expect(tree).toMatchSnapshot()
})
