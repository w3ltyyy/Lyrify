export type LyricLine = {
  text: string;
  startTime: number | null;
};

export type LyricsModel = {
  trackKey: string;
  lines: LyricLine[];
  synced: boolean;
  authorNickname?: string;
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

export function autoGenerateTimings(lines: LyricLine[], durationMs: number): LyricLine[] {
  const n = lines.length;
  if (!Number.isFinite(durationMs) || durationMs <= 0 || n <= 1) return lines;
  const hasAnyTimed = lines.some((l) => typeof l.startTime === "number");
  if (hasAnyTimed) return lines;

  const minLineMs = 1400;
  const maxLineMs = 6800;
  const sectionPauseMs = 1400;
  const punctPauseMs = 400;
  const endPadMs = 900;

  const clean = (t: string) => (t ?? "").replace(/\s+/g, " ").trim();
  const isSectionBreak = (t: string) => clean(t).length === 0;
  const lenScore = (t: string) => {
    const s = clean(t);
    if (!s) return 0;
    const alpha = (s.match(/[A-Za-zА-Яа-я0-9]/g) ?? []).length;
    const extra = (s.match(/[—–-]/g) ?? []).length * 0.8 + (s.match(/[.,!?…:;]/g) ?? []).length * 0.6;
    return Math.max(1, alpha + extra);
  };
  const hasPunctEnd = (t: string) => /[.!?…]$/.test(clean(t));

  const scores = lines.map((l) => lenScore(l.text));
  const totalScore = scores.reduce((a, b) => a + b, 0) || 1;
  const plannedPauses = lines.reduce((sum, l, i) => {
    if (i === 0) return sum;
    if (isSectionBreak(l.text)) return sum + sectionPauseMs;
    if (hasPunctEnd(lines[i - 1]?.text ?? "")) return sum + punctPauseMs;
    return sum;
  }, 0);

  const usable = Math.max(3000, durationMs - endPadMs - plannedPauses);

  let t = 0;
  return lines.map((l, i) => {
    if (i > 0) {
      if (isSectionBreak(l.text)) t += sectionPauseMs;
      else if (hasPunctEnd(lines[i - 1]?.text ?? "")) t += punctPauseMs;
    }
    const raw = (usable * (scores[i] / totalScore)) | 0;
    const dur = isSectionBreak(l.text)
      ? Math.min(900, minLineMs)
      : Math.min(maxLineMs, Math.max(minLineMs, raw));

    const start = Math.min(t, Math.max(0, durationMs - 500));
    t += dur;
    return { ...l, startTime: start };
  });
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
