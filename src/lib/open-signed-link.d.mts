export function openSignedLink(
  url: string,
  openFn: (url: string, target: string) => { opener: unknown } | null
): 'opened' | 'blocked'
