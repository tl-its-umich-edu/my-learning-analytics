/* global it, expect */

import React from 'react'
import Label from '../../components/Label'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Label
        value={5}
        color='blue'
        labelPlacement='up'
        labelText='Hello world'
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
