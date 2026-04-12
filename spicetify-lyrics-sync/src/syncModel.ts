export type LyricLine = {
  text: string;
  startTime: number | null;
};

export type LyricsModel = {
  trackKey: string;
  lines: LyricLine[];
  synced: boolean;
  authorNickname?: string;
  isNotFound?: boolean;
};

export function toTrackKey(artist: string, title: string, durationSeconds?: number): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const base = `${clean(artist)}-${clean(title)}`;
  if (durationSeconds) {
    return `${base}-${Math.round(durationSeconds)}`;
  }
  return base;
}

export function findCurrentLineIndex(lines: LyricLine[], progressMs: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    const st = lines[i].startTime;
    if (st !== null && st <= progressMs) {
      idx = i;
    }
  }
  return idx;
}

export function parseSyncedLyricsLrc(lrc: string): LyricLine[] {
  const result: LyricLine[] = [];
  const lines = lrc.split("\n");
  const timeRegex = /\[(\d+):(\d+\.?\d*)\]/g;

  for (const line of lines) {
    const times: number[] = [];
    let match;
    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      times.push(Math.round((min * 60 + sec) * 1000));
    }
    const text = line.replace(timeRegex, "").trim();
    if (!text && times.length === 0) continue;
    for (const t of times) {
      result.push({ text, startTime: t });
    }
  }
  return result.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));
}

export function parseUnsyncedLyricsPlain(plain: string): LyricLine[] {
  return plain
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((text) => ({ text, startTime: null }));
}
