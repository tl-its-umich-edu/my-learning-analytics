/* global it, expect, jest, beforeAll */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { TextDecoder, TextEncoder } from 'node:util'

globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder

let MemoryRouter
let SelectCard

beforeAll(async () => {
  ;({ MemoryRouter } = await import('react-router-dom'))
  SelectCard = (await import('../../components/SelectCard')).default
})

const selectCardProps = (courseInfo, cardData) => ({
  courseId: 1,
  courseInfo,
  enrollmentTypes: ['TeacherEnrollment'],
  cardData
})

const viewCards = [
  { viewCode: 'ra', title: 'Resources Accessed', path: '/courses/1/resources' },
  { viewCode: 'ap', title: 'Assignment Planning', path: '/courses/1/assignments' },
  { viewCode: 'gd', title: 'Grade Distribution', path: '/courses/1/grades' }
]

it.each([
  ['instructor', { isAdmin: false, enrollmentTypes: ['TeacherEnrollment'] }],
  ['MyLA admin', { isAdmin: true, enrollmentTypes: [] }]
])('%s disabling any view PUTs update_info and updates local state without a refetch', async (_role, roleProps) => {
  for (const view of viewCards) {
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ default: 'success' }) })
    globalThis.fetch = fetchMock

    // Shared courseInfo object, exactly as it comes from /info and is held in
    // React state for the session.
    const courseInfo = { course_view_options: { ra: 1, ap: 1, gd: 1 } }
    const cardData = { ...view, description: 'desc', image: null, helpUrl: null }
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    try {
      await act(async () => {
        root.render(
          <MemoryRouter>
            <SelectCard {...selectCardProps(courseInfo, cardData)} {...roleProps} />
          </MemoryRouter>
        )
      })

      // The view starts enabled (from course_view_options === 1).
      expect(container.textContent).toContain('Enabled')
      const toggle = container.querySelector(`button[aria-label="Enable ${view.title} view"]`)
      expect(toggle).not.toBeNull()

      await act(async () => {
        toggle.click()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      // A single PUT persists the change to the DB.
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, options] = fetchMock.mock.calls[0]
      expect(url).toBe('/api/v1/courses/1/update_info/')
      expect(options.method).toBe('PUT')
      expect(JSON.parse(options.body)).toEqual({ [view.viewCode]: { enabled: false } })

      // The local, in-session state is updated in place without re-fetching /info.
      expect(courseInfo.course_view_options[view.viewCode]).toBe(0)
      expect(container.textContent).toContain('Disabled')
    } finally {
      await act(async () => root.unmount())
      container.remove()
      globalThis.fetch = originalFetch
    }
  }
})

it('does not persist or flip local state when the save fails', async () => {
  const originalFetch = globalThis.fetch
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ default: 'fail' }) })
  globalThis.fetch = fetchMock

  const courseInfo = { course_view_options: { ra: 1, ap: 1, gd: 1 } }
  const cardData = { viewCode: 'gd', title: 'Grade Distribution', path: '/courses/1/grades', description: 'desc', image: null, helpUrl: null }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  try {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <SelectCard {...selectCardProps(courseInfo, cardData)} />
        </MemoryRouter>
      )
    })

    const toggle = container.querySelector('button[aria-label="Enable Grade Distribution view"]')
    await act(async () => {
      toggle.click()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    // A failed save must not change the local state.
    expect(courseInfo.course_view_options.gd).toBe(1)
    expect(container.textContent).toContain('Enabled')
  } finally {
    await act(async () => root.unmount())
    container.remove()
    globalThis.fetch = originalFetch
  }
})
