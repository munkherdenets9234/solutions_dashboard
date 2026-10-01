import type { Locale, TranslationValue } from './types'

export type TranslationKind = 'string' | 'strings' | 'objects'
type Values = Partial<Record<Locale, TranslationValue>>

export function kindOf(value: TranslationValue | undefined): TranslationKind | undefined
export function entryKind(values: Values, locales: Locale[]): TranslationKind
export function entryKeys(values: Values, locales: Locale[]): string[]
export function matchesKind(kind: TranslationKind, value: TranslationValue | undefined): boolean
export function cleanValue(kind: TranslationKind, value: TranslationValue | undefined): TranslationValue | undefined
export function serialize(
  rows: { path: string; kind: TranslationKind; values: Values }[],
  locales: Locale[]
): { path: string; values: Values }[]
