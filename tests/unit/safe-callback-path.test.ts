import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSafeCallbackPath } from '@/lib/safe-callback-path';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getSafeCallbackPath', () => {
  it.each([
    [null, '/'],
    [undefined, '/'],
    ['', '/'],
    ['https://attacker.example', '/'],
    ['//attacker.example/path', '/'],
    ['/\\attacker.example', '/'],
    ['https:\\\\attacker.example', '/'],
    ['https://trusted.example.attacker.example', '/'],
    ['javascript:alert(1)', '/'],
    ['not-a-path', '/'],
  ])('uses the safe fallback for %s', (candidate, expected) => {
    expect(getSafeCallbackPath(candidate)).toBe(expected);
  });

  it.each([
    ['/', '/'],
    ['/projects', '/projects'],
    ['/projects/42?tab=comments#latest', '/projects/42?tab=comments#latest'],
    ['/auth/login?callbackUrl=%2Fprojects', '/auth/login?callbackUrl=%2Fprojects'],
    ['/projects/%2Fprivate', '/projects/%2Fprivate'],
  ])('preserves local callback %s', (candidate, expected) => {
    expect(getSafeCallbackPath(candidate)).toBe(expected);
  });

  it('uses the safe fallback if URL parsing throws', () => {
    const NativeURL = globalThis.URL;
    class ThrowingURL extends NativeURL {
      constructor(url: string | URL, base?: string | URL) {
        if (url === '/throws') {
          throw new TypeError('Invalid URL');
        }
        super(url, base);
      }
    }

    vi.stubGlobal('URL', ThrowingURL);
    expect(getSafeCallbackPath('/throws')).toBe('/');
  });

  it('rejects a parsed URL with an unexpected origin', () => {
    const NativeURL = globalThis.URL;
    class UnexpectedOriginURL extends NativeURL {
      get origin(): string {
        return 'https://attacker.example';
      }
    }

    vi.stubGlobal('URL', UnexpectedOriginURL);
    expect(getSafeCallbackPath('/projects')).toBe('/');
  });
});
