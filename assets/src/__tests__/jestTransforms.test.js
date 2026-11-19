/* global it, expect */

import { runInNewContext } from 'node:vm'
import cssTransform from '../../config/jest/cssTransform.js'
import fileTransform from '../../config/jest/fileTransform.js'
import styles from '../index.css'

it('loads CSS imports through the configured transformer', () => {
  expect(styles).toEqual({})
  expect(typeof cssTransform.process('').code).toBe('string')
})

it('returns filename mocks as Jest transform results', () => {
  const result = fileTransform.process('', '/images/example.png')
  expect(typeof result.code).toBe('string')
  const context = { module: { exports: {} } }
  runInNewContext(result.code, context)
  expect(context.module.exports).toBe('example.png')
})

it('preserves the SVG filename and component mock', () => {
  const result = fileTransform.process('', '/images/example.svg')
  expect(typeof result.code).toBe('string')
  const context = { module: { exports: {} } }
  runInNewContext(result.code, context)
  expect(context.module.exports.default).toBe('example.svg')
  expect(context.module.exports.ReactComponent({ title: 'Example' })).toMatchObject({
    type: 'svg',
    props: { title: 'Example', children: 'example.svg' }
  })
})
