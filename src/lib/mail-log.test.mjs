import test from 'node:test'
import assert from 'node:assert/strict'
import { mailStatusLabel, mailErrorLabel, MAIL_STATUS_FILTERS } from './mail-log.mjs'

test('sent is labelled Accepted, never delivered or sent', () => {
  assert.equal(mailStatusLabel('sent'), 'Accepted')
  for (const s of ['pending', 'sent', 'failed']) {
    assert.doesNotMatch(mailStatusLabel(s), /deliver|^sent$/i)
  }
})

test('pending and failed labels', () => {
  assert.equal(mailStatusLabel('pending'), 'Pending')
  assert.equal(mailStatusLabel('failed'), 'Failed')
})

test('unknown status is shown as-is', () => {
  assert.equal(mailStatusLabel('mystery'), 'mystery')
  assert.equal(mailStatusLabel('toString'), 'toString')
})

test('error codes map to short labels', () => {
  assert.equal(mailErrorLabel('mail_not_configured'), 'Mail not configured')
  assert.equal(mailErrorLabel('rate_limited'), 'Rate limited')
  assert.equal(mailErrorLabel('upstream'), 'Mail service error')
  assert.equal(mailErrorLabel('unreachable'), 'Mail service unreachable')
  assert.equal(mailErrorLabel('recipient_opted_out'), 'Recipient unsubscribed')
})

test('unknown or empty error is shown as-is', () => {
  assert.equal(mailErrorLabel('weird_code'), 'weird_code')
  assert.equal(mailErrorLabel(''), '')
  assert.equal(mailErrorLabel('constructor'), 'constructor')
})

test('filters expose only the three backend statuses plus All', () => {
  assert.deepEqual(MAIL_STATUS_FILTERS.map((f) => f.value), ['', 'pending', 'sent', 'failed'])
  assert.deepEqual(MAIL_STATUS_FILTERS.map((f) => f.label), ['All', 'Pending', 'Accepted', 'Failed'])
})
