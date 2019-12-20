import React from 'react'
import InputBase from '@material-ui/core/InputBase'

function GradeInput (props) {
  const { children } = props
  return (
    <>
      <InputBase
        placeholder='Set a goal'
        {...props}
      />
      {children}
    </>
  )
}

export default GradeInput
