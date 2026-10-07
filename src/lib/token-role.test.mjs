import test from 'node:test'
import assert from 'node:assert/strict'
import { tokenRole } from './token-role.mjs'

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (payload) => `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`

test('reads the role claim', () => {
  assert.equal(tokenRole(jwt({ role: 'admin' })), 'admin')
  assert.equal(tokenRole(jwt({ role: 'staff' })), 'staff')
})

test('anything unreadable yields undefined', () => {
  for (const t of ['', 'abc', 'a.b.c', 'a..c', undefined, null, jwt({}), jwt({ role: 5 })]) {
    assert.equal(tokenRole(t), undefined)
  }
})
