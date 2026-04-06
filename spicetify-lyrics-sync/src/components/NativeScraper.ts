import { LyricLine } from "../syncModel";

export function findNativeLyricsContainerElements(): HTMLElement[] {
  const sels = [
    '[data-testid*="lyrics"]',
    '[data-testid*="lyrics-drawer"]',
    '[class*="lyrics-lyricsContainer"]',
    '[class*="LyricsScrollContainer"]',
    '[class*="nowPlayingLyrics"]',
    '.main-nowPlayingView-section > div[class*="lyrics"]',
    '.Root__right-sidebar [class*="Lyrics"]',
    '.Root__right-sidebar [class*="lyrics"]',
    'div[role="region"][aria-label*="Lyrics" i]',
    'div[aria-label*="Lyrics" i]',
    'aside[aria-label*="Lyrics" i]'
  ];
  
  const scoreNativeLyricsContainer = (el: HTMLElement): number => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return 0;
    
    // Allow off-screen if it's cached or loaded in background
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length < 8) return 0;
    return text.length + Math.min((rect.width * rect.height) / 800, 400);
  };

  const uniq = new Map<HTMLElement, number>();
  for (const sel of sels) {
    document.querySelectorAll(sel).forEach((n) => {
      if (!(n instanceof HTMLElement)) return;
      const sc = scoreNativeLyricsContainer(n);
      if (sc <= 0) return;
      const prev = uniq.get(n) ?? 0;
      if (sc > prev) uniq.set(n, sc);
    });
  }
  return Array.from(uniq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([el]) => el);
}

export function extractLinesFromNativeContainer(container: HTMLElement): LyricLine[] {
  const rowSelectors = [
    '[data-testid*="lyrics-line"]',
    '[data-testid*="lyrics-line-text"]',
    '[data-testid="fullscreen-lyric"]',
    '[class*="lyrics-line"]',
    '[class*="LyricsLine"]',
    '[class*="lyricsLine"]',
    'p[dir="auto"]'
  ];

  const dedupeLyricLines = (lines: LyricLine[]): LyricLine[] => {
    const out: LyricLine[] = [];
    let last = "";
    for (const l of lines) {
      const t = (l.text ?? "").replace(/\s+/g, " ").trim();
      if (!t) continue;
      const key = t.toLowerCase();
      if (key === last) continue;
      last = key;
      out.push({ text: t, startTime: l.startTime ?? null });
    }
    return out;
  };

  for (const sel of rowSelectors) {
    const nodes = Array.from(container.querySelectorAll(sel));
    if (nodes.length === 0) continue;
    const raw: LyricLine[] = [];
    for (const n of nodes) {
      if (!(n instanceof HTMLElement)) continue;
      const t = (n.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!t || t.length > 900) continue;
      raw.push({ text: t, startTime: null });
    }
    const deduped = dedupeLyricLines(raw);
    if (deduped.length > 0) return deduped;
  }

  const plain = (container.textContent ?? "").trim();
  if (!plain) return [];
  const byNl = plain.split(/\n+/).map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (byNl.length > 1) return byNl.map(text => ({ text, startTime: null }));
  return [{ text: plain.replace(/\s+/g, " ").trim(), startTime: null }];
}

export function tryClickSpotifyLyricsButton(): boolean {
  const primarySelectors = [
    '[data-testid*="lyrics-button"]',
    '[data-testid*="control-button-lyrics"]',
    'button[aria-label*="Lyrics" i]',
    'button[aria-label*="Текст" i]',
    'button[title*="Lyrics" i]',
    'button[title*="Текст" i]'
  ];
  for (const sel of primarySelectors) {
    const list = Array.from(document.querySelectorAll(sel));
    for (const btn of list) {
      if (!(btn instanceof HTMLButtonElement)) continue;
      if (btn.disabled) continue;
      if (btn.id === "lyrify-inline-trigger") continue;
      const bar = btn.closest('[data-testid="now-playing-bar"], .Root__now-playing-bar');
      if (!bar) continue;
      btn.click();
      return true;
    }
  }
  return false;
}

export async function tryFetchNativeSpotifyUiLyrics(options: {
  signal?: AbortSignal;
  restoreNativeLyrics: () => void;
  hideNativeLyrics: () => void;
  overlayIsOpen: () => boolean;
}): Promise<LyricLine[]> {
  const { signal, restoreNativeLyrics, hideNativeLyrics, overlayIsOpen } = options;
  let triedOpenPanel = false;

  for (let attempt = 0; attempt < 15; attempt++) {
    if (signal?.aborted) break;
    restoreNativeLyrics();
    const containers = findNativeLyricsContainerElements();
    for (const c of containers) {
        const lines = extractLinesFromNativeContainer(c);
        if (lines.length > 0) {
            if (overlayIsOpen()) hideNativeLyrics();
            return lines;
        }
    }
    if ((attempt === 4 || attempt === 8) && !triedOpenPanel) {
      triedOpenPanel = tryClickSpotifyLyricsButton();
    }
    await new Promise((r) => window.setTimeout(r, 450));
  }
  if (overlayIsOpen()) hideNativeLyrics();
  return [];
}
