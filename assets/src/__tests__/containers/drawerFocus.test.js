/* global it, expect, jest, beforeAll, beforeEach, afterEach */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { TextDecoder, TextEncoder } from 'node:util'

globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder

jest.mock('../../service/api', () => ({
  useCourseInfo: () => [true, false, {
    name: 'Synthetic course',
    course_data_loaded: 1,
    course_view_options: { ra: true, ap: true, gd: true }
  }]
}))

jest.mock('../../containers/ResourcesAccessed', () => {
  const ViewHeader = jest.requireActual('../../components/ViewHeader').default
  return () => <ViewHeader>Resources Accessed</ViewHeader>
})

let mockHeadingDelay = 0
jest.mock('../../containers/GradeDistribution', () => {
  const { useEffect, useState } = jest.requireActual('react')
  const ViewHeader = jest.requireActual('../../components/ViewHeader').default
  return function GradeDistribution () {
    const [ready, setReady] = useState(mockHeadingDelay === 0)
    useEffect(() => {
      const timer = setTimeout(() => setReady(true), mockHeadingDelay)
      return () => clearTimeout(timer)
    }, [])
    return ready ? <ViewHeader>Grade Distribution</ViewHeader> : null
  }
})

jest.mock('../../containers/AssignmentPlanningV2', () => () => null)

let MemoryRouter
let Route
let Routes
let Course
let root
let container

beforeAll(async () => {
  const globalsElement = document.createElement('script')
  globalsElement.id = 'myla_globals'
  globalsElement.type = 'application/json'
  globalsElement.textContent = JSON.stringify({
    survey_link: { text: '', url: '' },
    view_help_urls: {},
    user_courses_info: []
  })
  document.body.appendChild(globalsElement)
  ;({ MemoryRouter, Route, Routes } = await import('react-router-dom'))
  Course = (await import('../../containers/Course')).default
})

beforeEach(async () => {
  jest.useFakeTimers()
  mockHeadingDelay = 0
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/courses/1/resources']}>
        <Routes>
          <Route
            path='/courses/:courseId/*'
            element={<Course courseId={1} user={{ relatedCourses: [], admin: true, initials: 'T' }} />}
          />
        </Routes>
      </MemoryRouter>
    )
  })
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  jest.useRealTimers()
})

const menuButton = () => container.querySelector('[aria-label="Menu"]')
const heading = () => container.querySelector('.view-header')
const drawer = () => document.querySelector('.MuiDrawer-paper')

async function click (element, options = {}) {
  await act(async () => {
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options }))
  })
}

async function finishTransition () {
  await act(async () => jest.advanceTimersByTime(250))
}

async function openDrawer () {
  await act(async () => menuButton().focus())
  await click(menuButton())
  await finishTransition()
}

it.each([1, 0])('focuses an early-mounted destination after drawer exit (click detail %s)', async detail => {
  await openDrawer()
  await click(drawer().querySelector('a[href="/courses/1/grades"]'), { detail })
  expect(heading().textContent).toBe('Grade Distribution')
  expect(drawer()).not.toBeNull()
  await finishTransition()
  expect(drawer()).toBeNull()
  expect(document.activeElement).toBe(heading())
})

it.each(['Escape', 'backdrop'])('returns focus to Menu on %s dismissal', async reason => {
  await openDrawer()
  if (reason === 'Escape') {
    await act(async () => {
      drawer().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
  } else {
    await click(document.querySelector('.MuiBackdrop-root'))
  }
  await finishTransition()
  expect(drawer()).toBeNull()
  expect(document.activeElement).toBe(menuButton())
})

it('refocuses the heading when the current view is selected again', async () => {
  await openDrawer()
  await click(drawer().querySelector('a[href="/courses/1/resources"]'))
  await finishTransition()
  expect(document.activeElement).toBe(heading())
})

it('lets a late-mounted heading take focus after the drawer has exited', async () => {
  mockHeadingDelay = 500
  await openDrawer()
  await click(drawer().querySelector('a[href="/courses/1/grades"]'))
  await finishTransition()
  expect(drawer()).toBeNull()
  expect(heading()).toBeNull()
  expect(document.activeElement).not.toBe(menuButton())
  await finishTransition()
  expect(heading().textContent).toBe('Grade Distribution')
  expect(document.activeElement).toBe(heading())
})

it('resets navigation focus handling when the drawer is reopened and dismissed', async () => {
  await openDrawer()
  await click(drawer().querySelector('a[href="/courses/1/grades"]'))
  await finishTransition()
  await openDrawer()
  await click(document.querySelector('.MuiBackdrop-root'))
  await finishTransition()
  expect(document.activeElement).toBe(menuButton())
})
