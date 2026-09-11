type Entry<T> = { value: T; expiresAt: number };

export class TtlCache {
  private store = new Map<string, Entry<unknown>>();
  constructor(private readonly ttlMs: number) {}
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }
  set<T>(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
