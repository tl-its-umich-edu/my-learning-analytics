/* global it, expect, jest, beforeAll */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { TextDecoder, TextEncoder } from 'node:util'

globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder

let MemoryRouter
let App

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
  ;({ MemoryRouter } = await import('react-router-dom'))
  App = (await import('../../containers/App')).default
})

const user = {
  isLoggedIn: true,
  loginURL: '',
  relatedCourses: [],
  admin: true,
  initials: 'T'
}

it('sets one native document title for the course list, course, and views', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      name: 'Synthetic course',
      course_data_loaded: 0,
      course_view_options: { ra: true, ap: true, gd: true }
    })
  })

  async function renderTitle (pathname) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[pathname]}>
          <App user={user} />
        </MemoryRouter>
      )
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    const result = {
      title: document.title,
      count: document.head.querySelectorAll('title').length
    }
    await act(async () => root.unmount())
    container.remove()
    return result
  }

  try {
    const cases = [
      ['/courses', 'Courses | My Learning Analytics'],
      ['/courses/1', 'Synthetic course | My Learning Analytics'],
      ['/courses/1/grades', 'Grade Distribution | My Learning Analytics'],
      ['/courses/1/assignments', 'Assignment Planning | My Learning Analytics'],
      ['/courses/1/resources', 'Resources Accessed | My Learning Analytics']
    ]

    for (const [pathname, expectedTitle] of cases) {
      await expect(renderTitle(pathname)).resolves.toEqual({ title: expectedTitle, count: 1 })
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})

it('shows a view title only when the user can see that view, consistently across all three views', async () => {
  const originalFetch = globalThis.fetch

  async function renderTitle (pathname, renderUser, viewOptions) {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        name: 'Synthetic course',
        course_data_loaded: 0,
        course_view_options: viewOptions
      })
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[pathname]}>
          <App user={renderUser} />
        </MemoryRouter>
      )
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    const title = document.title
    await act(async () => root.unmount())
    container.remove()
    return title
  }

  const student = { isLoggedIn: true, loginURL: '', relatedCourses: [], admin: false, initials: 'S' }
  const admin = { isLoggedIn: true, loginURL: '', relatedCourses: [], admin: true, initials: 'T' }
  const courseTitle = 'Synthetic course | My Learning Analytics'
  const allDisabled = { ra: false, ap: false, gd: false }
  const allEnabled = { ra: true, ap: true, gd: true }
  const views = [
    ['resources', 'Resources Accessed'],
    ['assignments', 'Assignment Planning'],
    ['grades', 'Grade Distribution']
  ]

  try {
    // Distinct course ids avoid useFetch's module-level URL cache across renders.
    let id = 100
    for (const [route, label] of views) {
      // Student + disabled view: title falls back to the course name (view hidden).
      await expect(renderTitle(`/courses/${id++}/${route}`, student, allDisabled)).resolves.toBe(courseTitle)
      // Student + enabled view: the view title is shown.
      await expect(renderTitle(`/courses/${id++}/${route}`, student, allEnabled)).resolves.toBe(`${label} | My Learning Analytics`)
      // Teacher/admin + disabled view: the view title is still shown (preview mode).
      await expect(renderTitle(`/courses/${id++}/${route}`, admin, allDisabled)).resolves.toBe(`${label} | My Learning Analytics`)
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})
