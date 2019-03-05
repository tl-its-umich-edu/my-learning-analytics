const set = (chartConfig, propertyName, value) => ({ ...chartConfig, [propertyName]: value })

function setWidth (chartConfig, width) {
  return set(chartConfig, 'width', width)
}

function setHeight (chartConfig, height) {
  return set(chartConfig, 'height', height)
}

function setData (chartConfig, data) {
  return set(chartConfig, 'data', data)
}

function adjustViewport (width, height, margin) {
  const aWidth = width - margin.left - margin.right
  const aHeight = height - margin.top - margin.bottom
  return [aWidth, aHeight]
}

function destroyChart (el) {
  el.removeChild(el.childNodes[0])
}

// Courtesy of Mozilla: https://developer.mozilla.org/en-US/docs/Web/Events/resize
const createResize = function () {
  const callbacks = []
  let running = false

  // fired on resize event
  function resize () {
    if (!running) {
      running = true

      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(runCallbacks)
      } else {
        setTimeout(runCallbacks, 66)
      }
    }
  }

  // run the actual callbacks
  function runCallbacks () {
    callbacks.forEach(function (callback) {
      callback()
    })

    running = false
  }

  // adds callback to loop
  function addCallback (callback) {
    if (callback) {
      callbacks.push(callback)
    }
  }

  return {
    // public method to add additional callback
    add: function (callback) {
      if (!callbacks.length) {
        window.addEventListener('resize', resize)
      }
      addCallback(callback)
    },
    remove: () => window.removeEventListener('resize', resize)
  }
}

export {
  createResize,
  setWidth,
  setHeight,
  setData,
  adjustViewport,
  destroyChart
}
