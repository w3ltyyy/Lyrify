import { LyricsModel, parseSyncedLyricsLrc, parseUnsyncedLyricsPlain } from "./syncModel";

const LRCLIB_GET_URL = "https://lrclib.net/api/get";
const LYRICS_OVH_URL = "https://api.lyrics.ovh/v1";
const LYRICA_DEFAULT_URL = "https://test-0k.onrender.com";

async function fetchPlainLyricsFallback(artist: string, title: string, signal?: AbortSignal): Promise<string> {
  const url = `${LYRICS_OVH_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal });
  if (!res.ok) return "";
  const json: any = await res.json();
  const lyrics = typeof json?.lyrics === "string" ? json.lyrics.trim() : "";
  return lyrics;
}

function getLyricaBaseUrl() {
  try {
    const fromLs = localStorage.getItem("spotytext_lyrica_url")?.trim();
    if (fromLs) return fromLs.replace(/\/+$/, "");
  } catch {
    // ignore
  }
  return LYRICA_DEFAULT_URL;
}

async function fetchFromLyrica(artist: string, title: string, signal?: AbortSignal): Promise<{
  syncedLrc: string;
  plainLyrics: string;
}> {
  const base = getLyricaBaseUrl();
  const url = new URL("/lyrics/", `${base}/`);
  url.searchParams.set("artist", artist);
  url.searchParams.set("song", title);
  url.searchParams.set("timestamps", "true");
  url.searchParams.set("fast", "true");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal
  });
  if (!res.ok) return { syncedLrc: "", plainLyrics: "" };
  const json: any = await res.json();

  const syncedCandidates = [
    json?.syncedLyrics,
    json?.synced_lyrics,
    json?.lrc,
    json?.timestamps_lrc,
    json?.data?.syncedLyrics,
    json?.data?.synced_lyrics,
    json?.data?.lrc
  ].filter((x) => typeof x === "string" && x.trim());
  const syncedLrc = syncedCandidates.length ? String(syncedCandidates[0]).trim() : "";

  const plainCandidates = [
    json?.plainLyrics,
    json?.lyrics,
    json?.data?.plainLyrics,
    json?.data?.lyrics
  ].filter((x) => typeof x === "string" && x.trim());
  const plainLyrics = plainCandidates.length ? String(plainCandidates[0]).trim() : "";

  return { syncedLrc, plainLyrics };
}

export async function fetchLyricsFromLrclib(params: {
  artist: string;
  title: string;
  durationSeconds?: number;
  trackKey: string;
  signal?: AbortSignal;
  onDebug?: (info: {
    requestUrl: string;
    plainLen: number;
    hasSynced: boolean;
    syncedLyricsType: string;
    fallbackProvider?: string;
    fallbackPlainLen?: number;
    fallbackHasSynced?: boolean;
  }) => void;
}): Promise<LyricsModel> {
  const { artist, title, durationSeconds, trackKey, signal, onDebug } = params;

  const debug = (() => {
    try {
      return localStorage.getItem("spotytext_debug") === "1";
    } catch {
      return false;
    }
  })();

  const debugLog = (...args: any[]) => {
    if (!debug) return;
    // eslint-disable-next-line no-console
    console.log("[spotytext]", ...args);
  };

  const url = new URL(LRCLIB_GET_URL);
  url.searchParams.set("track_name", title);
  url.searchParams.set("artist_name", artist);
  if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) {
    // LRCLIB duration param expects seconds.
    url.searchParams.set("duration", String(Math.max(0, Math.round(durationSeconds))));
  }

  debugLog("LRCLIB request:", url.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      // Some environments behave better with a UA.
      "Accept": "application/json"
    },
    signal
  });

  if (!res.ok) {
    throw new Error(`LRCLIB HTTP ${res.status}`);
  }

  const json: any = await res.json();

  const plainLyrics: string = json?.plainLyrics ?? "";
  const syncedLyrics: string | null | undefined = json?.syncedLyrics ?? null;

  debugLog("LRCLIB response:", {
    plainLen: plainLyrics?.length ?? 0,
    hasSynced: Boolean(syncedLyrics),
    syncedType: typeof syncedLyrics,
    firstPlain: plainLyrics?.slice(0, 120) ?? "",
    firstSynced: syncedLyrics?.slice(0, 120) ?? ""
  });

  onDebug?.({
    requestUrl: url.toString(),
    plainLen: plainLyrics?.length ?? 0,
    hasSynced: Boolean(syncedLyrics),
    syncedLyricsType: typeof syncedLyrics
  });

  const unsyncedLines = plainLyrics ? parseUnsyncedLyricsPlain(plainLyrics) : [];
  const syncedLines = syncedLyrics ? parseSyncedLyricsLrc(syncedLyrics) : [];
  if (syncedLines.length > 0) {
    return {
      trackKey,
      lines: syncedLines.map((l) => ({ text: l.text, startTime: l.startTime })),
      synced: true
    };
  }

  // Try another multi-source provider before giving up on synced lyrics.
  const lyrica = await fetchFromLyrica(artist, title, signal);
  const lyricaSynced = lyrica.syncedLrc ? parseSyncedLyricsLrc(lyrica.syncedLrc) : [];
  if (lyricaSynced.length > 0) {
    onDebug?.({
      requestUrl: url.toString(),
      plainLen: plainLyrics?.length ?? 0,
      hasSynced: false,
      syncedLyricsType: typeof syncedLyrics,
      fallbackProvider: "lyrica",
      fallbackPlainLen: lyrica.plainLyrics.length,
      fallbackHasSynced: true
    });
    return {
      trackKey,
      lines: lyricaSynced.map((l) => ({ text: l.text, startTime: l.startTime })),
      synced: true
    };
  }

  if (unsyncedLines.length > 0) {
    onDebug?.({
      requestUrl: url.toString(),
      plainLen: plainLyrics?.length ?? 0,
      hasSynced: false,
      syncedLyricsType: typeof syncedLyrics,
      fallbackProvider: "lrclib-plain",
      fallbackPlainLen: plainLyrics?.length ?? 0,
      fallbackHasSynced: false
    });
    return {
      trackKey,
      lines: unsyncedLines,
      synced: false
    };
  }

  if (lyrica.plainLyrics.trim().length > 0) {
    const lyricaPlainLines = parseUnsyncedLyricsPlain(lyrica.plainLyrics);
    onDebug?.({
      requestUrl: url.toString(),
      plainLen: plainLyrics?.length ?? 0,
      hasSynced: false,
      syncedLyricsType: typeof syncedLyrics,
      fallbackProvider: "lyrica-plain",
      fallbackPlainLen: lyrica.plainLyrics.length,
      fallbackHasSynced: false
    });
    return {
      trackKey,
      lines: lyricaPlainLines,
      synced: false
    };
  }

  // Last plain-lyrics fallback source when everything else is empty.
  const fallbackPlain = await fetchPlainLyricsFallback(artist, title, signal);
  const fallbackLines = fallbackPlain ? parseUnsyncedLyricsPlain(fallbackPlain) : [];
  onDebug?.({
    requestUrl: url.toString(),
    plainLen: plainLyrics?.length ?? 0,
    hasSynced: false,
    syncedLyricsType: typeof syncedLyrics,
    fallbackProvider: "lyrics.ovh",
    fallbackPlainLen: fallbackPlain?.length ?? 0,
    fallbackHasSynced: false
  });
  return {
    trackKey,
    lines: fallbackLines,
    synced: false
  };
}

