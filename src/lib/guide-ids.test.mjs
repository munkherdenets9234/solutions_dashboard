import test from 'node:test'
import assert from 'node:assert/strict'
import { isGuideId, assertGuideId, guideConfirmationId } from './guide-ids.mjs'

const GOOD = '0123456789abcdef01234567'

test('valid 24-char lowercase hex passes', () => {
  assert.equal(isGuideId(GOOD), true)
  assert.equal(assertGuideId(GOOD), GOOD)
})

test('invalid ids fail', () => {
  for (const bad of ['..', '.', '', GOOD.toUpperCase(), GOOD + '0', GOOD.slice(1), 'a/b', `${GOOD.slice(2)}/.`, '../../x', `${GOOD.slice(0, 23)}%`, `${GOOD.slice(0, 23)}g`, undefined, null, 5]) {
    assert.equal(isGuideId(bad), false, String(bad))
    assert.throws(() => assertGuideId(bad), /Invalid identifier/)
  }
})

test('confirmation id is GA- plus last 6 uppercased', () => {
  assert.equal(guideConfirmationId(GOOD), 'GA-234567')
  assert.equal(guideConfirmationId('0123456789abcdef0123abcd'), 'GA-23ABCD')
})
