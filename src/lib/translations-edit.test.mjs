import test from 'node:test'
import assert from 'node:assert/strict'
import { entryKind, entryKeys, isIdentifierKey, matchesKind, cleanValue, serialize } from './translations-edit.mjs'

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

test('only key, id and icon are identifier fields', () => {
  for (const k of ['key', 'id', 'icon']) assert.equal(isIdentifierKey(k), true, k)
  for (const k of ['title', 'Key', 'keys', 'iconName', 'identifier', '']) assert.equal(isIdentifierKey(k), false, k)
})

test('a populated object list round-trips unchanged through load and serialize', () => {
  const values = {
    en: [
      { key: 'tours', icon: 'map', label: 'Tours', body: 'Guided tours' },
      { key: 'camps', icon: 'tent', label: 'Camps', body: 'Ger camps' },
    ],
    mn: [
      { key: 'tours', icon: 'map', label: 'Аялал', body: 'Хөтөчтэй аялал' },
      { key: 'camps', icon: 'tent', label: 'Бааз', body: 'Гэр бааз' },
    ],
    ko: [
      { key: 'tours', icon: 'map', label: '투어', body: '가이드 투어' },
      { key: 'camps', icon: 'tent', label: '캠프', body: '게르 캠프' },
    ],
  }
  const row = { path: 'about.stats', kind: entryKind(values, L), keys: entryKeys(values, L), values }
  assert.equal(row.kind, 'objects')
  assert.deepEqual(row.keys, ['key', 'icon', 'label', 'body'])
  assert.deepEqual(serialize([row], L), [{ path: 'about.stats', values }])
})


test('serialize keeps base unchanged', () => {
  const base = { mn: 'Сайн', en: 'Hi' }
  const out = serialize([{ path: 'a', kind: 'string', values: { en: 'Hello' }, base }], L)
  assert.deepEqual(out, [{ path: 'a', values: { en: 'Hello' }, base: { mn: 'Сайн', en: 'Hi' } }])
  assert.deepEqual(Object.keys(out[0].base), ['mn', 'en'])
  assert.equal(out[0].base, base)
})

test('serialize omits base when the row has none', () => {
  const out = serialize(
    [
      { path: 'a', kind: 'string', values: { en: 'x' } },
      { path: 'b', kind: 'string', values: { en: 'y' }, base: {} },
    ],
    L,
  )
  assert.deepEqual(out, [
    { path: 'a', values: { en: 'x' } },
    { path: 'b', values: { en: 'y' } },
  ])
  for (const o of out) assert.equal('base' in o, false)
})

test('serialize drops base with an entry that is blank in every language', () => {
  const out = serialize([{ path: 'a', kind: 'string', values: { en: '  ' }, base: { en: 'Hi' } }], L)
  assert.deepEqual(out, [])
})

test('serialize keeps base for a language whose value was blanked', () => {
  const out = serialize([{ path: 'a', kind: 'string', values: { en: 'Hello', mn: '' }, base: { en: 'Hi', mn: 'Сайн' } }], L)
  assert.deepEqual(out, [{ path: 'a', values: { en: 'Hello' }, base: { en: 'Hi', mn: 'Сайн' } }])
})

test('base survives load to serialize for string, strings and objects kinds', () => {
  const entries = [
    { path: 's', values: { en: 'a' }, base: { ko: 'k', en: 'b' } },
    { path: 'l', values: { en: ['a', 'b'] }, base: { en: ['x', 'y'], mn: ['z'] } },
    { path: 'o', values: { en: [{ id: '1', t: 'a' }] }, base: { en: [{ t: 'q', id: '1' }] } },
  ]
  const rows = entries.map((e) => ({ ...e, kind: entryKind(e.values, L), keys: entryKeys(e.values, L) }))
  const out = serialize(rows, L)
  assert.deepEqual(out, entries)
  assert.equal(JSON.stringify(out), JSON.stringify(entries))
})
