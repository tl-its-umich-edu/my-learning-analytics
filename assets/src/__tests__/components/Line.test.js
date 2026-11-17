/* global it, expect */

import { act } from 'react'
import Line from '../../components/Line'
import renderer from 'react-test-renderer'

it('renders correctly', async () => {
  let component
  await act(async () => {
    component = renderer.create(
      <Line
        value={50}
        outOf={100}
        barHeight={50}
        color='green'
        placement='up1'
        label='Goal'
      />
    )
  })
  const tree = component.toJSON()

  expect(tree).not.toBeNull()
  expect(tree).toMatchSnapshot()
})
