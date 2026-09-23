const SCHOOL_PAGE_CACHE_TTL_MS = 300_000;

type CacheEntry<T> = { value: T; storedAt: number };

const cache = new Map<string, CacheEntry<unknown>>();

export function readSchoolPageCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;

  if (Date.now() - entry.storedAt >= SCHOOL_PAGE_CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }

  // TTL is measured from the original write. A revisit must not silently
  // extend stale school intelligence indefinitely.
  return entry.value;
}

export function writeSchoolPageCache<T>(key: string, value: T): void {
  cache.set(key, { value, storedAt: Date.now() });
}

export function invalidateSchoolPageCache(key: string): void {
  cache.delete(key);
}

export function invalidateSchoolPageCachePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function clearSchoolPageCache(): void {
  cache.clear();
}
