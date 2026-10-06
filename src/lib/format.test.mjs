import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('format.ts is valid UTF-8 (no stray cp1252 bytes)', () => {
  const buf = readFileSync(new URL('./format.ts', import.meta.url))
  assert.doesNotThrow(() => new TextDecoder('utf-8', { fatal: true }).decode(buf))
})
