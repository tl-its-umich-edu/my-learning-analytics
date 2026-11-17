/* global it, expect */

import { act } from 'react'
import Label from '../../components/Label'
import renderer from 'react-test-renderer'

it('renders correctly', async () => {
  let component
  await act(async () => {
    component = renderer.create(
      <Label
        labelText='Current: 75.0'
        color='blue'
        visualPercent={75}
        top='59px'
        zIndex='2'
      />
    )
  })
  const tree = component.toJSON()

  expect(tree).not.toBeNull()
  expect(tree).toMatchSnapshot()
})
