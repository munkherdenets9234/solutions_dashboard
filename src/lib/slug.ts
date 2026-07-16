// Converts arbitrary text into a URL-safe slug — lowercase words joined by
// single hyphens, diacritics stripped. Used to auto-generate slugs from a
// title/name on create, instead of trusting free-text human input (which
// has produced malformed slugs like "/land-70" in the past).
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
