/* global it, expect */

import React from 'react'
import Line from '../../components/Line'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Line
        value={50}
        outOf={100}
        barHeight={50}
        color='green'
        placement='up1'
        label='Goal'
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
