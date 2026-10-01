// Pure helpers behind TranslationsEditor. Plain JS so `node --test` can run
// them without a build step (see translations-edit.test.mjs).

function isItem(x) {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export function kindOf(value) {
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value) && value.length > 0) return typeof value[0] === 'string' ? 'strings' : 'objects'
  return undefined
}

// An entry's shape is set by the first language with a non-empty value.
export function entryKind(values, locales) {
  for (const locale of locales) {
    const k = kindOf(values[locale])
    if (k) return k
  }
  return 'string'
}

// Keys of an object list: the union across every item in every language.
export function entryKeys(values, locales) {
  const keys = []
  for (const locale of locales) {
    const v = values[locale]
    if (!Array.isArray(v)) continue
    for (const item of v) {
      if (!isItem(item)) continue
      for (const key of Object.keys(item)) if (!keys.includes(key)) keys.push(key)
    }
  }
  return keys
}

// True when the stored value can be edited by the entry's editor.
export function matchesKind(kind, value) {
  if (value === undefined || value === null) return true
  if (kind === 'string') return typeof value === 'string' || (Array.isArray(value) && value.length === 0)
  if (!Array.isArray(value)) return false
  if (kind === 'strings') return value.every((x) => typeof x === 'string')
  return value.every(isItem)
}

// The value to send, or undefined when the language is blank. A value that
// does not match the entry's shape is passed through untouched.
export function cleanValue(kind, value) {
  if (value === undefined || value === null) return undefined
  if (!matchesKind(kind, value)) return value
  if (kind === 'string') return typeof value === 'string' && value.trim() !== '' ? value : undefined
  if (kind === 'strings') {
    const items = value.filter((s) => s.trim() !== '')
    return items.length > 0 ? items : undefined
  }
  const items = value.filter((it) => Object.values(it).some((s) => String(s).trim() !== ''))
  return items.length > 0 ? items : undefined
}

// rows: [{ path, kind, values }] -> [{ path, values }], blank languages and
// fully blank paths omitted.
export function serialize(rows, locales) {
  const out = []
  for (const row of rows) {
    const values = {}
    for (const locale of locales) {
      const v = cleanValue(row.kind, row.values[locale])
      if (v !== undefined) values[locale] = v
    }
    if (Object.keys(values).length > 0) out.push({ path: row.path, values })
  }
  return out
}
