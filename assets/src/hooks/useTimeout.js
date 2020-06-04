import { useEffect, useRef } from 'react'

// Code modified from example by Dan Abramov
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

function useTimeout (callback, delay) {
  const savedCallback = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the timeout
  useEffect(() => {
    function tick () {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setTimeout(tick, delay)
      return () => clearTimeout(id)
    }
  }, [])
}

export default useTimeout
