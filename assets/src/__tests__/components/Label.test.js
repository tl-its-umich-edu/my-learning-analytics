/* global it, expect */

import React from 'react'
import Label from '../../components/Label'
import renderer from 'react-test-renderer'

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Label
        labelText='Current: 75.0'
        color='blue'
        visualXPercent={75}
        top='59px'
        zIndex='2'
      />
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
