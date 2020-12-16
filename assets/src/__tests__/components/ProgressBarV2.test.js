/* global it, expect */

import React from 'react'
import ProgressBarV2 from '../../components/ProgressBarV2'
import renderer from 'react-test-renderer'
import TestThemeProvider from '../../components/TestThemeProvider'
it('renders correctly', () => {
  const tree = renderer
    .create(
      <TestThemeProvider>
        <ProgressBarV2
          submitted=''
          score={85}
          outOf={100}
          percentWidth={90}
          lines={[{
            label: 'Current',
            value: 80,
            color: 'steelblue',
            labelPlacement: 'down'
          },
          {
            label: 'Goal',
            value: 40,
            color: 'green',
            labelPlacement: 'up'
          },
          {
            label: 'Max Possible',
            value: 23,
            color: 'grey',
            labelPlacement: 'downLower'
          }]}
        />
      </TestThemeProvider>
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
