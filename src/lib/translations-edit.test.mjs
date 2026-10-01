import test from 'node:test'
import assert from 'node:assert/strict'
import { entryKind, entryKeys, matchesKind, cleanValue, serialize } from './translations-edit.mjs'

const L = ['en', 'mn', 'ko']

test('kind comes from the first non-empty language', () => {
  assert.equal(entryKind({ en: [], mn: ['a'] }, L), 'strings')
  assert.equal(entryKind({ ko: [{ a: 'x' }] }, L), 'objects')
  assert.equal(entryKind({}, L), 'string')
})

test('keys are the union across items and languages', () => {
  assert.deepEqual(entryKeys({ en: [{}, { a: '1' }], mn: [{ b: '2', a: '3' }] }, L), ['a', 'b'])
})

test('mismatched shapes are detected and passed through untouched', () => {
  const values = { en: 'hello', mn: ['a', 'b'] }
  assert.equal(matchesKind('string', values.mn), false)
  assert.deepEqual(serialize([{ path: 'p', kind: 'string', values }], L), [{ path: 'p', values }])
  assert.equal(matchesKind('strings', ['a', { x: '1' }]), false)
  assert.equal(matchesKind('objects', ['a']), false)
})

test('blank languages and blank paths are dropped', () => {
  assert.equal(cleanValue('string', '  '), undefined)
  assert.equal(cleanValue('strings', ['', ' ']), undefined)
  assert.equal(cleanValue('objects', [{ a: '' }]), undefined)
  const rows = [
    { path: 'a', kind: 'string', values: { en: 'x', mn: '' } },
    { path: 'b', kind: 'strings', values: { en: [''] } },
  ]
  assert.deepEqual(serialize(rows, L), [{ path: 'a', values: { en: 'x' } }])
})

test('rows keep their own kind after others are removed (no index drift)', () => {
  const rows = [
    { path: 'b', kind: 'strings', values: { en: ['k', ''] } },
    { path: 'c', kind: 'string', values: { en: 'v' } },
  ]
  assert.deepEqual(serialize(rows, L), [
    { path: 'b', values: { en: ['k'] } },
    { path: 'c', values: { en: 'v' } },
  ])
})
