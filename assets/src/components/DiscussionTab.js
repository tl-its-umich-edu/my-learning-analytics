import React, { useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import DiscussionSentenceList from './DiscussionSentenceList'
import Typography from '@material-ui/core/Typography'

function DiscussionTab (props) {
  const { usage, coherence } = props
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <>
      <AppBar position='static'>
        <Tabs value={tabIndex} onChange={(_, value) => setTabIndex(value)}>
          <Tab label='My Contribution' />
          <Tab label='Class Discussion' />
        </Tabs>
      </AppBar>
      {tabIndex === 0 && <DiscussionSentenceList usage={usage} coherence={coherence} />}
      {tabIndex === 1 && <Typography>Class Discussion</Typography>}
    </>
  )
}

export default DiscussionTab
