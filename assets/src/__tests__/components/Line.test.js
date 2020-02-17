/* global it, expect */

import React from 'react'
import Line from '../../components/Line'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Line
        height={10}
        left={5}
        color='blue'
        labelPlacement='up'
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
