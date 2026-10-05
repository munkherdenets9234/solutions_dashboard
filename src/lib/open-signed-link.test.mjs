import test from 'node:test'
import assert from 'node:assert/strict'
import { openSignedLink } from './open-signed-link.mjs'

test('null from openFn means blocked', () => {
  assert.equal(openSignedLink('https://x.test/f', () => null), 'blocked')
})

test('opened window gets opener cleared and no noopener feature is passed', () => {
  const win = { opener: 'parent' }
  const calls = []
  const r = openSignedLink('https://x.test/f', (...a) => (calls.push(a), win))
  assert.equal(r, 'opened')
  assert.equal(win.opener, null)
  assert.deepEqual(calls, [['https://x.test/f', '_blank']])
})

test('opener assignment throwing still counts as opened', () => {
  const win = {
    set opener(_v) {
      throw new Error('denied')
    },
  }
  assert.equal(openSignedLink('https://x.test/f', () => win), 'opened')
})
