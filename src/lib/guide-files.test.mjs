import test from 'node:test'
import assert from 'node:assert/strict'
import { isPreviewableMime } from './guide-files.mjs'

test('only jpeg and png are previewable', () => {
  assert.equal(isPreviewableMime('image/jpeg'), true)
  assert.equal(isPreviewableMime('image/png'), true)
})

test('pdf, other images and junk are not previewable', () => {
  for (const m of ['application/pdf', 'image/gif', 'image/webp', 'image/svg+xml', 'text/html', '', 'image/jpeg2']) {
    assert.equal(isPreviewableMime(m), false, m)
  }
})

test('non-string input is not previewable', () => {
  assert.equal(isPreviewableMime(undefined), false)
  assert.equal(isPreviewableMime(null), false)
  assert.equal(isPreviewableMime(5), false)
})

test('mime comparison ignores case and parameters', () => {
  assert.equal(isPreviewableMime('IMAGE/JPEG'), true)
  assert.equal(isPreviewableMime('image/png; charset=binary'), true)
})
