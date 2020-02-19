import React from 'react'
import '@fortawesome/fontawesome-free'

const styles = theme => {

}

function IconLabel(props) {
  const {
    icon,
    label
  } = props

  return (
    <i class={icon}>{'   ' + label}</i>
  )
}

export default IconLabel