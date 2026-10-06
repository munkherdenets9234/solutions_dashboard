import test from 'node:test'
import assert from 'node:assert/strict'
import { guideLabel, guideValues, monthName } from './guide-labels.mjs'

const ENUMS = {
  status: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
  language: ['mn', 'en', 'ko', 'zh', 'ja', 'ru', 'fr', 'es', 'other'],
  level: ['native', 'good', 'fluent', 'intermediate', 'basic'],
  region: ['gobi', 'central', 'khuvsgul', 'western', 'eastern', 'ulaanbaatar_terelj', 'other'],
  tourType: ['private', 'group', 'vip', 'adventure_4x4', 'cultural', 'hiking_trekking', 'festival', 'business_corporate'],
  tripLength: ['d1_3', 'd4_7', 'd8_14', 'd15_plus'],
  fileKind: ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid'],
  gender: ['male', 'female', 'other', 'undisclosed'],
}

test('known values map to display text', () => {
  assert.equal(guideLabel('tourType', 'adventure_4x4'), 'Adventure / 4x4')
  assert.equal(guideLabel('status', 'shortlisted'), 'Shortlisted')
  assert.equal(guideLabel('language', 'mn'), 'Mongolian')
})

test('unknown value or group returns the raw value', () => {
  assert.equal(guideLabel('status', 'mystery'), 'mystery')
  assert.equal(guideLabel('nogroup', 'x'), 'x')
})

for (const [group, values] of Object.entries(ENUMS)) {
  test(`every ${group} value has a label`, () => {
    for (const v of values) {
      const l = guideLabel(group, v)
      assert.notEqual(l, v, `${group}.${v} has no label`)
      assert.ok(l.length > 0)
    }
  })
}

test('guideValues returns the keys in order, [] for unknown group', () => {
  assert.deepEqual(guideValues('status'), ENUMS.status)
  assert.deepEqual(guideValues('region'), ['gobi', 'central', 'khuvsgul', 'western', 'eastern', 'ulaanbaatar_terelj', 'other'])
  assert.deepEqual(guideValues('nogroup'), [])
})

test('monthName maps 1-12 to names, passes others through', () => {
  assert.equal(monthName(1), 'January')
  assert.equal(monthName(12), 'December')
  assert.equal(monthName(0), '0')
  assert.equal(monthName(13), '13')
})
