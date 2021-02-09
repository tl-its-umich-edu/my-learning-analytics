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
          percentWidth={100}
          lines={[{
            label: 'Current',
            value: 80,
            color: 'steelblue',
            placement: 'down1'
          },
          {
            label: 'Goal',
            value: 40,
            color: 'green',
            placement: 'up1'
          },
          {
            label: 'Max Possible',
            value: 23,
            color: 'grey',
            placement: 'down2'
          }]}
        />
      </TestThemeProvider>
    ).toJSON()

  expect(tree).toMatchSnapshot()
})
