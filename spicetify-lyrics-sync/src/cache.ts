import type { LyricsModel } from "./syncModel";

const CACHE_PREFIX = "lyrify_cache_";
const MAX_CACHE_ENTRIES = 50;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type CacheEntry = {
  model: LyricsModel;
  timestamp: number;
};

export class LyricsCache {
  static get(trackKey: string): LyricsModel | null {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + trackKey);
      if (!raw) return null;
      const entry: CacheEntry = JSON.parse(raw);
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        this.remove(trackKey);
        return null;
      }
      return entry.model;
    } catch {
      return null;
    }
  }

  static set(trackKey: string, model: LyricsModel) {
    try {
      const entry: CacheEntry = {
        model,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_PREFIX + trackKey, JSON.stringify(entry));
      this.cleanup();
    } catch {
      // ignore quota errors
    }
  }

  static remove(trackKey: string) {
    localStorage.removeItem(CACHE_PREFIX + trackKey);
  }

  static clear() {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
  }

  private static cleanup() {
    try {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .map((k) => ({
          key: k,
          time: JSON.parse(localStorage.getItem(k) || "{}").timestamp || 0
        }))
        .sort((a, b) => b.time - a.time);

      if (keys.length > MAX_CACHE_ENTRIES) {
        keys.slice(MAX_CACHE_ENTRIES).forEach((k) => localStorage.removeItem(k.key));
      }
    } catch {
      // ignore
    }
  }
}
