import React, { useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import DiscussionSentenceList from './DiscussionSentenceList'

function DiscussionTab (props) {
  const { myUsage, myCoherence, classUsage, classCoherence } = props
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <>
      <AppBar position='static'>
        <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)}>
          <Tab label='My Contribution' />
          <Tab label='Class Discussion' />
        </Tabs>
      </AppBar>
      {tabIndex === 0 &&
        <DiscussionSentenceList
          usage={myUsage}
          coherence={myCoherence} />}
      {tabIndex === 1 &&
        <DiscussionSentenceList
          usage={classUsage}
          coherence={classCoherence} />}
    </>
  )
}

export default DiscussionTab
