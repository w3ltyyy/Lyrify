import { state } from "./state";
import { STYLES, CSS_ID } from "./styles";
import { createOverlay } from "./components/Overlay";
import { createMiniPlayer } from "./components/MiniPlayer";
import { createPlayerObserver } from "./playerObserver";
import { fetchLyricsFromLrclib } from "./lrclibClient";
import { toTrackKey, autoGenerateTimings, findCurrentLineIndex, LyricsModel, LyricLine } from "./syncModel";
import { LyricsCache } from "./cache";
import { SPOTIFY_SELECTORS } from "./selectors";
import { debounceByAnimationFrame, getOrCreateAuthorId } from "./utils";
import { mountInlineTrigger } from "./components/InlineTrigger";
import { tryFetchNativeSpotifyUiLyrics } from "./components/NativeScraper";
import { readUiSettings } from "./components/SettingsPanel";
import { createManualSyncController } from "./manualSync";

const BACKEND_BASE_URL = "https://lyrify-api.aquashield.lol";

async function backendGetSync(trackKey: string, signal?: AbortSignal): Promise<any> {
    const url = new URL(`${BACKEND_BASE_URL}/sync`);
    url.searchParams.set("trackKey", trackKey);
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.found ? json.record : null;
}

async function fetchSpotifyApiLyrics(uri?: string, debugLogger?: (msg: string) => void): Promise<{ lines: LyricLine[], synced: boolean } | null> {
    if (!uri) {
        debugLogger?.("API Fetch: No URI provided.");
        return null;
    }
    const trackId = uri.split(":").pop();
    if (!trackId) {
        debugLogger?.("API Fetch: Could not parse trackId from URI.");
        return null;
    }

    try {
        const cosmos = (window as any).Spicetify?.CosmosAsync;
        if (!cosmos) {
            debugLogger?.("API Fetch: CosmosAsync not available.");
            return null;
        }

        let res: any;
        let successEndpoint = "";
        const endpoints = [
            `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&vocalRemoval=false`,
            `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json`,
            `wg://lyrics/v1/track/${trackId}`,
            `sp://lyrics/v1/track/${trackId}`
        ];

        for (const ep of endpoints) {
            try {
                res = await cosmos.get(ep);
                if (res && res.lyrics) {
                    successEndpoint = ep.split('?')[0]; // Simplify log
                    break;
                }
            } catch (err: any) {
                // Silent catch, try next endpoint
            }
        }

        // Ultimate fallback: Try Spicetify Platform wrapper if available
        if (!res || !res.lyrics) {
            const platformLyrics = (window as any).Spicetify?.Platform?.LyricsAPI;
            if (platformLyrics && platformLyrics.getLyrics) {
                try {
                    const l = await platformLyrics.getLyrics(trackId);
                    if (l && l.lyrics) {
                        res = l;
                        successEndpoint = "Platform.LyricsAPI";
                    }
                } catch (e) { }
            }
        }

        if (!res || !res.lyrics || !res.lyrics.lines) {
            debugLogger?.("API Fetch: Failed on all known endpoints.");
            return null;
        }
        debugLogger?.(`API Fetch: Success via ${successEndpoint}`);

        const linesList = res.lyrics.lines;
        if (!Array.isArray(linesList)) return null;

        const out: LyricLine[] = [];
        let hasSync = false;
        for (const line of linesList) {
            const text = (line.words ?? "").trim();
            if (!text && line.words !== "") continue;
            const ms = line.startTimeMs ? parseInt(line.startTimeMs, 10) : null;
            if (ms !== null && !isNaN(ms) && ms > 0) hasSync = true;
            out.push({ text, startTime: ms !== null && !isNaN(ms) ? ms : null });
        }

        return out.length > 0 ? { lines: out, synced: hasSync } : null;
    } catch {
        return null;
    }
}

let isStarted = false;
let currentFetchAbort: AbortController | null = null;
let highlightTimer: number | null = null;
let miniOpen = false;

async function startExtension() {
    if (isStarted) return;
    isStarted = true;

    try {
        const w = window as any;
    let isScrubbingNative = false;

        if (!document.getElementById(CSS_ID)) {
            const style = document.createElement("style");
            style.id = CSS_ID;
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        // Telemetry heartbeat
        setTimeout(() => {
            try {
                fetch(`${BACKEND_BASE_URL}/telemetry`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        authorId: getOrCreateAuthorId(),
                        authorNickname: readUiSettings().nickname || undefined
                    })
                }).catch(() => { });
            } catch (e) { }
        }, 3000);

        const manual = createManualSyncController({
            lines: state.getLyrics().lines, // will be updated in-place via mutations or proxy
            getProgressMs: () => w.Spicetify.Player.getProgress(),
            setLineStartTime: (idx, time) => {
                const l = state.getLyrics();
                if (l.lines[idx]) {
                    l.lines[idx].startTime = time;
                    state.setLyrics({ ...l }); // Trigger update
                }
            },
            onRecord: (idx, time) => {
                state.setActiveIndex(idx);
                overlay.refreshRecordHud();
            },
            onIndexChange: (idx) => {
                overlay.refreshRecordHud();
            },
            onStart: () => {
                const lyrics = state.getLyrics();
                const info = observer.getTrackInfo();
                if (info.artist && info.title) {
                    overlay.updateRecordHudTrack(`${info.artist} — ${info.title}`, lyrics.synced);
                }
                overlay.showRecordHud();
            },
            onStop: () => {
                const hud = document.getElementById("lyrify-record-hud");
                if (hud) hud.classList.remove("s-open");
            }
        });

        let lastManualTrackKey = "";
        let hadManualLines = false;
        state.subscribe(() => {
            const lyrics = state.getLyrics();
            const hasLines = lyrics.lines.length > 0;
            
            if (lyrics.trackKey !== lastManualTrackKey) {
                lastManualTrackKey = lyrics.trackKey;
                hadManualLines = hasLines;
                manual.updateLines(lyrics.lines);
                if (manual.isRecording()) {
                    const info = observer.getTrackInfo();
                    overlay.updateRecordHudTrack(`${info.artist || "?"} — ${info.title || "?"}`, lyrics.synced);
                    overlay.showRecordHud();
                }
            } else if (hasLines && !hadManualLines) {
                // Lyrics arrived for the same track after initial empty state (loading done)
                hadManualLines = true;
                manual.updateLines(lyrics.lines);
                if (manual.isRecording()) {
                    const info = observer.getTrackInfo();
                    overlay.updateRecordHudTrack(`${info.artist || "?"} — ${info.title || "?"}`, lyrics.synced);
                    overlay.showRecordHud();
                }
            }
        });

        const toggleMini = () => {
            miniOpen = !miniOpen;
            if (miniOpen) {
                miniPlayer.element.classList.add("s-open");
            } else {
                miniPlayer.element.classList.remove("s-open");
                overlay.resetFollow();
            }
            overlay.render(miniOpen);
        };

        const overlay = createOverlay({
            manual,
            onSave: async (key, lines) => {
                await fetch(`${BACKEND_BASE_URL}/sync`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trackKey: key, lines })
                });
            },
            onSubmit: async (key, lines, authorIdInput) => {
                const s = readUiSettings();
                const authorId = getOrCreateAuthorId();
                const authorNickname = s.nickname || undefined;
                const res = await fetch(`${BACKEND_BASE_URL}/submission`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trackKey: key, lines, authorId, authorNickname })
                });
                return res.json();
            },
            onClearCache: () => {
                LyricsCache.clear();
                overlay.showClearWave();
                loadLyrics(true);
            },
            toggleMini
        });

        const miniPlayer = createMiniPlayer({
            onClose: () => {
                miniOpen = false;
                miniPlayer.element.classList.remove("s-open");
                overlay.resetFollow();
                overlay.render(miniOpen);
            }
        });
        if (!document.getElementById("lyrify-mini")) {
            document.body.appendChild(miniPlayer.element);
        }

        const observer = createPlayerObserver((newUri) => {
            overlay.resetFollow();
            loadLyrics(false, 0, newUri);
        });

        const updateHighlight = () => {
            if (manual.isRecording()) return;
            const lyrics = state.getLyrics();
            const hasTimed = lyrics.lines.some(l => l.startTime !== null);

            // Also update mini player if it's open
            if (miniOpen) {
                miniPlayer.render();
            }

            if (!hasTimed) {
                state.setActiveIndex(-1);
                return;
            }
            const progressMs = w.Spicetify.Player.getProgress();
            const idx = findCurrentLineIndex(lyrics.lines, progressMs);
            if (idx !== state.getActiveIndex()) {
                state.setActiveIndex(idx);
            }
        };

        w.Spicetify.Player.addEventListener("onplaypause", () => {
            if (miniOpen) miniPlayer.render();
        });

        const ensureHighlightTimer = () => {
            if (highlightTimer) return;
            highlightTimer = window.setInterval(updateHighlight, 200);
        };

        const updateTriggerButtonState = (isOpen: boolean) => {
            const btn = document.getElementById("lyrify-inline-trigger");
            if (btn) btn.classList.toggle("s-active", isOpen);
        };

        const loadLyrics = async (autoOpen: boolean, retryCount = 0, expectedUri?: string) => {
            if (currentFetchAbort) currentFetchAbort.abort();
            currentFetchAbort = new AbortController();
            const signal = currentFetchAbort.signal;

            const info = observer.getTrackInfo();
            if (!info.artist || !info.title) {
                if (retryCount < 5) {
                    // Spotify might be slow to load track data at startup
                    setTimeout(() => loadLyrics(autoOpen, retryCount + 1, expectedUri), 1000);
                }
                return;
            }

            // Transition guard: if we have an expected URI from songchange event, 
            // but the current metadata doesn't match yet, we wait.
            if (expectedUri && info.uri && info.uri !== expectedUri && retryCount < 10) {
                setTimeout(() => {
                    if (!signal.aborted) loadLyrics(autoOpen, retryCount + 1, expectedUri);
                }, 200);
                return;
            }

            const trackKey = toTrackKey(info.artist, info.title, info.durationSeconds);
            const relaxedKey = toTrackKey(info.artist, info.title);

            if (signal.aborted) return;
            overlay.resetFollow();
            overlay.setHeader(`${info.artist} — ${info.title}`);
            overlay.updateRecordHudTrack(`${info.artist} — ${info.title}`, false); 
            overlay.applyAccentColor(info.imageUrl);
            state.setLyrics({ trackKey, lines: [], synced: false });
            overlay.setMeta("");

            let debugDetails = `Extracted: artist="${info.artist}"\ntitle="${info.title}"\ntrackKey="${trackKey}"\nrelaxedTrackKey="${relaxedKey}"`;
            overlay.setDebug(debugDetails);
            overlay.render(miniOpen);

            const addDebug = (msg: string) => {
                if (signal.aborted) return;
                debugDetails += `\n\n${msg}`;
                overlay.setDebug(debugDetails);
            };

            const sendMissingPing = (trackKey: string, artist: string, title: string) => {
                fetch(`${BACKEND_BASE_URL}/track-missing`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trackKey, artist: artist, title: title })
                }).catch(() => { });
            };

            const sendPlayPing = (trackKey: string, artist: string, title: string, hasSynced: boolean, uri?: string) => {
                fetch(`${BACKEND_BASE_URL}/track-play`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ trackKey, artist: artist, title: title, hasSynced, uri })
                }).catch(() => { });
            };

            try {
                // 1. Cache — zero latency, show immediately
                const cached = LyricsCache.get(trackKey) || LyricsCache.get(relaxedKey);
                if (cached && cached.lines.length > 0) {
                    if (signal.aborted) return;
                    state.setLyrics(cached);
                    addDebug(`Source: Cache\nTrackKey: ${cached.trackKey}`);
                    if (cached.synced) ensureHighlightTimer();
                    overlay.render(miniOpen);
                    sendPlayPing(trackKey, info.artist, info.title, cached.synced, info.uri);
                    return;
                }

                // 2. Progressive parallel fetch — show first good result, upgrade if better arrives
                // Priority score: synced Backend=100, synced LRCLIB/Spotify=50, unsynced=10
                let bestScore = -1;
                overlay.setLoading(true);

                const tryApply = (model: LyricsModel, score: number, sourceName: string) => {
                    if (signal.aborted) return;
                    if (score <= bestScore) return; // only upgrade, never downgrade
                    bestScore = score;
                    state.setLyrics(model);
                    LyricsCache.set(trackKey, model);
                    addDebug(`Source: ${sourceName}\nSynced: ${model.synced}\nLines: ${model.lines.length}`);
                    if (model.synced) ensureHighlightTimer();
                    overlay.render(miniOpen);
                };

                const s = readUiSettings();

                // Backend (priority 100 — verified community data)
                const backendPromise = (async () => {
                    try {
                        const rec = await backendGetSync(trackKey, signal) || await backendGetSync(relaxedKey, signal);
                        if (rec && !signal.aborted) {
                            tryApply({
                                trackKey: rec.trackKey || trackKey,
                                lines: rec.lines,
                                synced: true,
                                authorNickname: rec.authorNickname
                            }, 100, `Backend (Author: ${rec.authorNickname || "Anonymous"})`);
                        }
                    } catch (e) { addDebug(`Backend error: ${e}`); }
                })();

                // LRCLIB (priority 50 synced, 10 plain)
                const lrclibPromise = (async () => {
                    try {
                        const m = await fetchLyricsFromLrclib({
                            artist: info.artist, title: info.title,
                            durationSeconds: info.durationSeconds, trackKey, signal,
                            onDebug: (dbg) => addDebug(`LRCLIB: plain=${dbg.plainLen} synced=${dbg.hasSynced} fallback=${dbg.fallbackProvider ?? "-"}`)
                        });
                        if (m && m.lines.length > 0 && !signal.aborted) {
                            if (m.synced) {
                                tryApply(m, 50, "LRCLIB (Synced)");
                            } else {
                                const shouldAutogen = s.autoGenerate && info.durationMs;
                                const finalLines = shouldAutogen ? autoGenerateTimings(m.lines, info.durationMs!) : m.lines;
                                tryApply({ ...m, trackKey, lines: finalLines, synced: !!shouldAutogen }, 10, `LRCLIB (Plain${shouldAutogen ? " + AutoGen" : ""})`);
                            }
                        }
                    } catch (e) { addDebug(`LRCLIB error: ${e}`); }
                })();

                // Spotify API (priority 50 synced, 10 plain)
                const spotifyPromise = (async () => {
                    try {
                        const raw = await fetchSpotifyApiLyrics(info.uri, addDebug);
                        if (raw && raw.lines.length > 0 && !signal.aborted) {
                            const m: LyricsModel = { ...raw, trackKey };
                            if (m.synced) {
                                tryApply(m, 50, "Spotify API (Synced)");
                            } else {
                                const shouldAutogen = s.autoGenerate && info.durationMs;
                                const finalLines = shouldAutogen ? autoGenerateTimings(m.lines, info.durationMs!) : m.lines;
                                tryApply({ ...m, lines: finalLines, synced: !!shouldAutogen }, 10, `Spotify API (Plain${shouldAutogen ? " + AutoGen" : ""})`);
                            }
                        }
                    } catch (e) { addDebug(`Spotify error: ${e}`); }
                })();

                // Wait for all to finish
                await Promise.allSettled([backendPromise, lrclibPromise, spotifyPromise]);

                if (signal.aborted) return;

                // Send play ping with whatever we ended up with
                const finalLyrics = state.getLyrics();
                if (finalLyrics.trackKey === trackKey && finalLyrics.lines.length > 0 && bestScore >= 0) {
                    sendPlayPing(trackKey, info.artist, info.title, finalLyrics.synced, info.uri);
                    return;
                }

                // 3. Ultimate fallback: native DOM scraper
                addDebug("No API lyrics, trying native DOM scraper...");
                try {
                    isScrubbingNative = true;
                    const nativeLines = await tryFetchNativeSpotifyUiLyrics({
                        signal,
                        restoreNativeLyrics: () => (window as any).Spicetify?.Player?.origin?.restoreNativeLyrics?.(),
                        hideNativeLyrics: () => (window as any).Spicetify?.Player?.origin?.hideNativeLyrics?.(),
                        overlayIsOpen: () => overlay.element.style.display !== "none"
                    });
                    if (nativeLines.length > 0) {
                        if (signal.aborted) return;
                        state.setLyrics({ trackKey, lines: nativeLines, synced: false });
                        addDebug(`Source: Spotify UI\nLines: ${nativeLines.length}`);
                        overlay.render(miniOpen);
                        sendPlayPing(trackKey, info.artist, info.title, false, info.uri);
                        return;
                    }
                } catch (e) {
                    addDebug(`Native scrubber error: ${e}`);
                } finally {
                    isScrubbingNative = false;
                }

                if (signal.aborted) return;
                addDebug(`Source: None\nStatus: 404`);
                overlay.setLoading(false);
                state.setLyrics({
                    trackKey,
                    lines: [{ text: "Кажется, мы не нашли текст к этой песне :(", startTime: null }],
                    synced: false
                });
                overlay.render(miniOpen);
                sendMissingPing(trackKey, info.artist, info.title);
                sendPlayPing(trackKey, info.artist, info.title, false, info.uri);

            } catch (e) {
                if (e instanceof Error && e.name === "AbortError") return;
                addDebug(`Critical Load error: ${e}`);
                overlay.render(miniOpen);
                sendPlayPing(trackKey, info.artist, info.title, false, info.uri);
            }
        };

        const mountAll = () => {
            const selectors = SPOTIFY_SELECTORS.mainView;
            for (const sel of selectors) {
                const target = document.querySelector(sel);
                if (target && target instanceof HTMLElement) {
                    if (getComputedStyle(target).position === "static") {
                        target.style.position = "relative";
                    }
                    const host = document.getElementById("lyrify-host") || document.createElement("div");
                    host.id = "lyrify-host";
                    if (host.parentElement !== target) target.appendChild(host);
                    if (overlay.element.parentElement !== host) host.appendChild(overlay.element);
                    break;
                }
            }
            mountInlineTrigger(() => {
                const el = overlay.element;
                if (el.style.display === "none") {
                    el.style.display = "flex";
                    overlay.render(miniOpen);
                    updateTriggerButtonState(true);
                } else {
                    el.style.display = "none";
                    updateTriggerButtonState(false);
                }
            });
            // Initial state sync for button
            updateTriggerButtonState(overlay.element.style.display !== "none");
        };

        // Subscriptions
        state.subscribe(() => {
            overlay.render(miniOpen);
            miniPlayer.render();
        });

        // Navigation logic
        const hideOnNav = () => {
            if (isScrubbingNative) return;
            overlay.element.style.display = "none";
            miniOpen = false;
            if (miniPlayer.element) miniPlayer.element.classList.remove("s-open");
            updateTriggerButtonState(false);
            (window as any).Spicetify?.Player?.origin?.restoreNativeLyrics?.();
        };

        const platHist: any = w.Spicetify?.Platform?.History;
        if (platHist?.listen) {
            platHist.listen(() => {
                // Any history change (forward/back/click) hides the overlay
                hideOnNav();
            });
        }

        // Initial load
        mountAll();
        loadLyrics(false);

        const debouncedMount = debounceByAnimationFrame(() => mountAll());
        const domObserver = new MutationObserver(() => debouncedMount());
        domObserver.observe(document.body, { childList: true, subtree: true });

        // Global Keydown for Recording
        window.addEventListener("keydown", (e) => {
            if (!manual.isRecording()) return;
            const isSpace = e.code === "Space" || e.key === " ";
            if (isSpace) {
                // Handled by manualSync.ts internal listener as well, 
                // but we ensure it's captured if focus is weird.
            }
        }, { capture: true });

    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[lyrify] Startup failed:", err);
        isStarted = false;
    }
}

(window as any).lyrify_settings = readUiSettings();
(window as any).__lyrify_start = startExtension;

if ((window as any).Spicetify?.Player) {
    setTimeout(startExtension, 500);
} else {
    const tick = () => {
        if ((window as any).Spicetify?.Player) setTimeout(startExtension, 500);
        else setTimeout(tick, 200);
    };
    tick();
}
