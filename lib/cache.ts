interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export const CacheKeys = {
  menu: (restaurantId: string) => `menu:${restaurantId}`,
  restaurant: (slug: string) => `restaurant:${slug.toLowerCase()}`,
  settings: (restaurantId: string) => `settings:${restaurantId}`,
  tables: (slug: string) => `tables:${slug.toLowerCase()}`,
  tableValidation: (slug: string, tableToken: string) => `table_val:${slug.toLowerCase()}:${tableToken}`,
};

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    memoryStore.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  delete(key: string): void {
    memoryStore.delete(key);
  },

  invalidatePrefix(prefix: string): void {
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
      }
    }
  },

  clear(): void {
    memoryStore.clear();
  },
};

export function invalidateMenuCache(restaurantId?: string): void {
  if (restaurantId) {
    memoryCache.delete(CacheKeys.menu(restaurantId));
  }
  memoryCache.invalidatePrefix('menu:');
}

export function invalidateRestaurantCache(slug?: string): void {
  if (slug) {
    memoryCache.delete(CacheKeys.restaurant(slug));
  }
  memoryCache.invalidatePrefix('restaurant:');
  memoryCache.invalidatePrefix('settings:');
}

export function invalidateTableCache(slug?: string): void {
  if (slug) {
    memoryCache.delete(CacheKeys.tables(slug));
  }
  memoryCache.invalidatePrefix('table_val:');
  memoryCache.invalidatePrefix('tables:');
}
