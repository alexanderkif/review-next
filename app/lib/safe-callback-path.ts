export function getSafeCallbackPath(candidate: string | null | undefined): string {
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\')
  ) {
    return '/';
  }

  try {
    const url = new URL(candidate, 'https://callback.invalid');
    if (url.origin !== 'https://callback.invalid') {
      return '/';
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
