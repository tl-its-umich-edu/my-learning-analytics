/* global fetch */

const get = url => {
  return fetch(url)
    .then(res => res.json())
}

export default get
