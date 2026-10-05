// Display text for guide application enum values. Unknown input is returned
// unchanged so a new backend value still shows something readable.
const LABELS = {
  status: { new: 'New', reviewing: 'Reviewing', shortlisted: 'Shortlisted', rejected: 'Rejected', hired: 'Hired' },
  language: {
    mn: 'Mongolian', en: 'English', ko: 'Korean', zh: 'Chinese', ja: 'Japanese',
    ru: 'Russian', fr: 'French', es: 'Spanish', other: 'Other',
  },
  level: { native: 'Native', good: 'Good', fluent: 'Fluent', intermediate: 'Intermediate', basic: 'Basic' },
  region: {
    gobi: 'Gobi', central: 'Central', khuvsgul: 'Khuvsgul', western: 'Western', eastern: 'Eastern',
    ulaanbaatar_terelj: 'Ulaanbaatar / Terelj', other: 'Other',
  },
  tourType: {
    private: 'Private', group: 'Group', vip: 'VIP', adventure_4x4: 'Adventure / 4x4', cultural: 'Cultural',
    hiking_trekking: 'Hiking / Trekking', festival: 'Festival', business_corporate: 'Business / Corporate',
  },
  tripLength: { d1_3: '1-3 days', d4_7: '4-7 days', d8_14: '8-14 days', d15_plus: '15+ days' },
  fileKind: {
    photo: 'Photo', id_card: 'ID card', driver_license: 'Driver license',
    guide_certificate: 'Guide certificate', cv: 'CV', first_aid: 'First aid certificate',
  },
  gender: { male: 'Male', female: 'Female', other: 'Other', undisclosed: 'Prefer not to say' },
}

export function guideLabel(group, value) {
  const g = Object.hasOwn(LABELS, group) ? LABELS[group] : undefined
  return g && Object.hasOwn(g, value) ? g[value] : value
}

// Allowed values of a label group, in display order (used to validate filters).
export function guideValues(group) {
  return Object.hasOwn(LABELS, group) ? Object.keys(LABELS[group]) : []
}
