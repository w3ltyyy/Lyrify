import { state } from "../state";
import { h } from "../domUtils";
import { extractDominantColorFromImage, debounceByAnimationFrame } from "../utils";
import { createSettingsPanel } from "./SettingsPanel";
import { createRecordHud } from "./RecordHud";
import { ManualSyncController } from "../manualSync";
import { formatMs } from "../utils";

const SVG_PREV = `<svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L3.483 1.141a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
const SVG_NEXT = `<svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l8.517-5.709a.7.7 0 0 1 1.083.593v12.532a.7.7 0 0 1-1.083.593L4 9.15V14.3a.7.7 0 0 1-.7.7H1.6a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7H3.3z"/></svg>`;
const SVG_PLAY = `<svg viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894a.7.7 0 0 1-1.05-.607V1.713z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;


export function createOverlay(options: {
  manual: ManualSyncController;
  onSave: (key: string, lines: any[]) => void;
  onSubmit: (key: string, lines: any[], authorId: string) => Promise<any>;
  toggleMini: () => void;
  onClearCache: () => void;
}) {
  const overlay = h("div", { id: "lyrify-overlay", style: { display: "none" } });
  const card = h("div", { id: "lyrify-card" });
  const loadingBar = h("div", { id: "lyrify-loading-bar" });
  const loadingBarInner = h("div", { id: "lyrify-loading-bar-inner" });
  loadingBar.appendChild(loadingBarInner);
  
  const header = h("div", { id: "lyrify-header" });
  const headerTitleEl = h("div", { id: "lyrify-title" });
  const reqSyncBtn = h("button", { className: "lyrify-req-sync-btn" }, "Request Sync");
  
  const headerRight = h("div", { id: "lyrify-header-right" });
  const splitViewBtn = h("button", { id: "lyrify-splitview-toggle", title: "Immersive Split-screen" }, "⛶");
  const miniBtn = h("button", { id: "lyrify-mini-toggle" }, "Mini");
  const settingsBtn = h("button", { id: "lyrify-settings-toggle", title: "Display settings" }, "⚙");
  
  headerRight.appendChild(splitViewBtn);
  headerRight.appendChild(miniBtn);
  headerRight.appendChild(settingsBtn);
  header.appendChild(headerTitleEl);
  header.appendChild(reqSyncBtn);
  header.appendChild(headerRight);

  const body = h("div", { id: "lyrify-body" });
  const meta = h("div", { id: "lyrify-meta" });
  
  const scrollWrap = h("div", { id: "lyrify-scroll-wrap" });
  const scrollInner = h("div", { id: "lyrify-scroll-inner" });
  const linesEl = h("div", { id: "lyrify-lines" });
  const jumpNowBtn = h("button", { id: "lyrify-jump-now", className: "lyrify-btn", style: { display: "none" } }, "Go to current line");

  const debugInfo = h("div", { 
    id: "lyrify-debug-info", 
    style: { 
        fontSize: "11px", 
        opacity: "0.5", 
        marginTop: "auto", 
        paddingTop: "8px", 
        whiteSpace: "pre-wrap",
        display: "none"
    } 
  });

  scrollInner.appendChild(linesEl);
  scrollWrap.appendChild(scrollInner);
  scrollWrap.appendChild(jumpNowBtn);
  body.appendChild(meta);
  body.appendChild(scrollWrap);
  body.appendChild(debugInfo);

  body.appendChild(debugInfo);
  const clearWave = h("div", { id: "lyrify-clear-wave" });
  overlay.appendChild(clearWave);

  const handleSubmit = () => {
    const lyrics = state.getLyrics();
    if (!lyrics.trackKey || lyrics.lines.length === 0) return;
    options.onSubmit(lyrics.trackKey, lyrics.lines, ""); // authorId handled in index.ts
  };

  const settingsPanel = createSettingsPanel(overlay, options.onClearCache, options.manual, (ignore) => {
    ignoreProgrammaticScroll = ignore;
  });
  const recordHud = createRecordHud(options.manual, handleSubmit, () => settingsPanel.syncSettings());

  const vibrantBg = h("div", { id: "lyrify-vibrant-bg" });
  for (let i = 0; i < 4; i++) {
    const blob = h("div", { className: `lyrify-blob lyrify-blob-${i}` });
    vibrantBg.appendChild(blob);
  }

  // --- SPLIT SCREEN UI ---
  const leftPanel = h("div", { id: "lyrify-left-panel" });
  
  const coverWrap = h("div", { id: "lyrify-fs-cover-wrap" });
  const coverArt = h("img", { id: "lyrify-fs-cover", src: "" }) as HTMLImageElement;
  const coverOverlay = h("div", { id: "lyrify-fs-cover-overlay" });
  
  const trackTitle = h("div", { id: "lyrify-fs-title" }, "-");
  const trackArtist = h("div", { id: "lyrify-fs-artist" }, "-");
  
  const seekSection = h("div", { id: "lyrify-fs-seek" });
  const seekCurrent = h("div", { className: "lyrify-fs-time" }, "0:00");
  const seekRange = h("input", { type: "range", min: "0", max: "1000", step: "1", value: "0" }) as HTMLInputElement;
  const seekTotal = h("div", { className: "lyrify-fs-time" }, "0:00");
  seekSection.appendChild(seekCurrent);
  seekSection.appendChild(seekRange);
  seekSection.appendChild(seekTotal);

  const btnPrev = h("button", { className: "lyrify-fs-btn", title: "Previous" });
  const btnPlay = h("button", { className: "lyrify-fs-btn s-play", title: "Play / Pause" });
  const btnNext = h("button", { className: "lyrify-fs-btn", title: "Next" });
  btnPrev.innerHTML = SVG_PREV;
  btnPlay.innerHTML = SVG_PLAY;
  btnNext.innerHTML = SVG_NEXT;
  
  coverOverlay.appendChild(btnPrev);
  coverOverlay.appendChild(btnPlay);
  coverOverlay.appendChild(btnNext);
  
  coverWrap.appendChild(coverArt);
  coverWrap.appendChild(coverOverlay);

  leftPanel.appendChild(coverWrap);
  leftPanel.appendChild(seekSection);
  leftPanel.appendChild(trackTitle);
  leftPanel.appendChild(trackArtist);

  // Bind full-screen player actions
  btnPrev.onclick = () => { (window as any).Spicetify.Player.back(); isAutoFollowEnabled = true; };
  btnPlay.onclick = () => { (window as any).Spicetify.Player.togglePlay(); };
  btnNext.onclick = () => { (window as any).Spicetify.Player.next(); isAutoFollowEnabled = true; };

  let isSeekDragging = false;
  seekRange.onpointerdown = () => { isSeekDragging = true; };
  seekRange.onpointerup = () => { isSeekDragging = false; };

  seekRange.oninput = () => {
      const dur = (window as any).Spicetify.Player.getDuration();
      const val = Number(seekRange.value);
      seekCurrent.textContent = formatMs(Math.floor((val / 1000) * dur));
      seekRange.style.setProperty("--progress", `${val / 10}%`);
  };
  seekRange.onchange = () => {
      const dur = (window as any).Spicetify.Player.getDuration();
      const val = Number(seekRange.value);
      (window as any).Spicetify.Player.seek(Math.floor((val / 1000) * dur));
  };
  // -------------------------

  const rightWrap = h("div", { className: "lyrify-right-wrap" });
  rightWrap.appendChild(loadingBar);
  rightWrap.appendChild(header);
  rightWrap.appendChild(settingsPanel.element);
  rightWrap.appendChild(body);

  card.appendChild(leftPanel);
  card.appendChild(rightWrap);
  
  const exitFsBtn = h("div", { className: "lyrify-fs-exit-btn", title: "Exit Full Screen" });
  exitFsBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 10l-4 4-4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  overlay.appendChild(vibrantBg); // Blobs are behind the card
  overlay.appendChild(exitFsBtn);
  overlay.appendChild(card);
  overlay.appendChild(recordHud.element);

  let currentDebugText = "";

  const applyAccentColor = async (imageUrl?: string) => {
    if (!imageUrl) {
      overlay.style.setProperty("--lyrify-bg", "linear-gradient(180deg, #1c1c1c 0%, #121212 100%)");
      overlay.style.setProperty("--lyrify-card-bg", "#171717");
      overlay.style.setProperty("--lyrify-line-active-bg", "rgba(30,215,96,0.20)");
      overlay.style.setProperty("--lyrify-accent-soft", "rgba(30,215,96,0.24)");
      overlay.style.setProperty("--lyrify-accent-border", "rgba(30,215,96,0.72)");
      overlay.style.setProperty("--lyrify-accent-text", "#d8ffe7");
      overlay.style.setProperty("--lyrify-accent-strong", "rgba(30,215,96,1)");
      overlay.style.setProperty("--lyrify-fade-edge", "rgba(23, 23, 23, 0.98)");
      return;
    }

    const result = await extractDominantColorFromImage(imageUrl);
    coverArt.src = imageUrl;

    if (!result) return;
    const { dominant, palette } = result;
    const { r, g, b } = dominant;
    overlay.style.setProperty("--lyrify-bg", `linear-gradient(180deg, rgb(${Math.max(28, Math.floor(r * 0.42))}, ${Math.max(28, Math.floor(g * 0.42))}, ${Math.max(28, Math.floor(b * 0.42))}) 0%, #121212 100%)`);
    const cr = Math.max(26, Math.floor(r * 0.32));
    const cg = Math.max(26, Math.floor(g * 0.32));
    const cb = Math.max(26, Math.floor(b * 0.32));
    overlay.style.setProperty("--lyrify-card-bg", `rgba(${cr},${cg},${cb},0.96)`);
    overlay.style.setProperty("--lyrify-line-active-bg", `rgba(${r},${g},${b},0.30)`);
    overlay.style.setProperty("--lyrify-accent-soft", `rgba(${r},${g},${b},0.30)`);
    overlay.style.setProperty("--lyrify-accent-border", `rgba(${r},${g},${b},0.88)`);
    overlay.style.setProperty("--lyrify-accent-text", "#ffffff");
    overlay.style.setProperty("--lyrify-accent-strong", `rgb(${r},${g},${b})`);
    overlay.style.setProperty("--lyrify-fade-edge", `rgba(${cr},${cg},${cb},0.96)`);

    // Vibrant blobs (use palette if available, else derive harmonious shifts)
    let c1 = rgbToHsl(r, g, b);
    let c2 = [(c1[0] + 40) % 360, Math.min(100, c1[1] + 10), Math.max(10, c1[2] - 5)];
    let c3 = [(c1[0] - 35 + 360) % 360, c1[1], Math.min(90, c1[2] + 10)];
    let c4 = [(c1[0] + 120) % 360, Math.max(0, c1[1] - 20), c1[2]];

    if (palette && palette.length >= 4) {
      c1 = rgbToHsl(palette[0].r, palette[0].g, palette[0].b);
      c2 = rgbToHsl(palette[1].r, palette[1].g, palette[1].b);
      c3 = rgbToHsl(palette[2].r, palette[2].g, palette[2].b);
      c4 = rgbToHsl(palette[3].r, palette[3].g, palette[3].b);
      
      // Softly boost brightness and saturation for punchy blobs
      [c1, c2, c3, c4].forEach(c => {
         c[1] = Math.min(100, c[1] + 20); // boost saturation
         c[2] = Math.min(85, Math.max(35, c[2] + 10)); // normalize lightness
      });
    }

    overlay.style.setProperty("--lyrify-color-1", `hsl(${c1[0]}, ${c1[1]}%, ${c1[2]}%)`);
    overlay.style.setProperty("--lyrify-color-2", `hsl(${c2[0]}, ${c2[1]}%, ${c2[2]}%)`);
    overlay.style.setProperty("--lyrify-color-3", `hsl(${c3[0]}, ${c3[1]}%, ${c3[2]}%)`);
    overlay.style.setProperty("--lyrify-color-4", `hsl(${c4[0]}, ${c4[1]}%, ${c4[2]}%)`);

    // Fix fade edge for vibrant mode
    const isVibrant = (window as any).lyrify_settings?.vibrant;
    if (isVibrant) {
      overlay.style.setProperty("--lyrify-fade-edge", `rgba(18, 18, 18, 0.5)`);
    } else {
      overlay.style.setProperty("--lyrify-fade-edge", `rgba(${cr},${cg},${cb},0.96)`);
    }
  };

  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  let lastLyricsKey = "";
  let isMiniOpen = false;

  let isAutoFollowEnabled = true;
  let ignoreProgrammaticScroll = false;

  const updateJumpBtnVisibility = () => {
    if (isMiniOpen) {
        jumpNowBtn.style.display = "none";
        return;
    }
    const activeIdx = state.getActiveIndex();
    const activeNode = linesEl.children[activeIdx] as HTMLElement;
    if (activeNode) {
        const rect = activeNode.getBoundingClientRect();
        const viewRect = scrollInner.getBoundingClientRect();
        const isVisible = rect.top >= (viewRect.top - 10) && rect.bottom <= (viewRect.bottom + 10);
        jumpNowBtn.style.display = isVisible ? "none" : "block";
    } else {
        jumpNowBtn.style.display = "none";
    }
  };

  const disableFollow = () => {
      if (isAutoFollowEnabled) {
          isAutoFollowEnabled = false;
          // Trigger a re-render or at least jump btn visibility check
          updateJumpBtnVisibility();
      }
  };

  scrollInner.addEventListener("wheel", disableFollow, { passive: true });
  scrollInner.addEventListener("touchstart", disableFollow, { passive: true });
  scrollInner.onscroll = debounceByAnimationFrame(() => {
      updateJumpBtnVisibility();
      
      // Dynamic masking: remove fade if at top or bottom
      const st = scrollInner.scrollTop;
      const sh = scrollInner.scrollHeight;
      const ch = scrollInner.clientHeight;
      scrollInner.classList.toggle('s-no-mask-top', st <= 30);
      scrollInner.classList.toggle('s-no-mask-bottom', st + ch >= sh - 30);

      if (!ignoreProgrammaticScroll) {
          disableFollow();
      }
  });


  settingsBtn.onclick = () => settingsPanel.toggle();
  miniBtn.onclick = () => options.toggleMini();

  let isSplitView = false;
  
  const toggleSplitView = () => {
      isSplitView = !isSplitView;
      overlay.classList.toggle("s-split-view", isSplitView);
  };
  
  let mouseTimer: any = null;
  overlay.addEventListener("mousemove", () => {
      if (!isSplitView) return;
      overlay.classList.add("s-mouse-active");
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => {
          overlay.classList.remove("s-mouse-active");
      }, 2500);
  });
  
  splitViewBtn.onclick = toggleSplitView;
  exitFsBtn.onclick = toggleSplitView;

  // High-framerate metadata syncing independent of lyrics
  let lastPlayState: boolean | null = null;
  const syncLoop = () => {
      if (isSplitView) {
          const spc = (window as any).Spicetify.Player;
          const progressMs = spc.getProgress();
          const durationMs = spc.getDuration();
          const isPlaying = spc.isPlaying();
          const trackInfo = spc.data?.track?.metadata || {};
          const itemInfo = spc.data?.item || {};
          
          if (lastPlayState !== isPlaying) {
              btnPlay.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
              lastPlayState = isPlaying;
          }
          
          if (!isSeekDragging) {
             const curStr = formatMs(progressMs);
             const totStr = formatMs(durationMs);
             if (seekCurrent.textContent !== curStr) seekCurrent.textContent = curStr;
             if (seekTotal.textContent !== totStr) seekTotal.textContent = totStr;
             const rawVal = durationMs > 0 ? (progressMs / durationMs) * 1000 : 0;
             const valStr = String(rawVal);
             if (seekRange.value !== valStr) seekRange.value = valStr;
             seekRange.style.setProperty("--progress", `${rawVal / 10}%`);
          }

          const fallbackArtist = safeText(itemInfo?.artists?.map((a: any) => safeText(a?.name)).join(", "));
          const newTitle = trackInfo.title || itemInfo?.name || "-";
          const newArtist = trackInfo.artist_name || fallbackArtist || "-";
          if (trackTitle.textContent !== newTitle) trackTitle.textContent = newTitle;
          if (trackArtist.textContent !== newArtist) trackArtist.textContent = newArtist;
      }
      setTimeout(syncLoop, 100);
  };
  syncLoop();

  jumpNowBtn.onclick = () => {
    isAutoFollowEnabled = true;
    const active = linesEl.querySelector(".s-active");
    if (active) {
        ignoreProgrammaticScroll = true;
        active.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => { ignoreProgrammaticScroll = false; }, 1000);
        jumpNowBtn.style.display = "none";
    }
  };

  return {
    element: overlay,
    resetSplitView: () => {
        isSplitView = false;
        overlay.classList.remove("s-split-view");
    },
    setHeader: (text: string) => { headerTitleEl.textContent = text; },
    setMeta: (text: string) => { meta.textContent = text; },
    setDebug: (text: string) => { currentDebugText = text; debugInfo.textContent = text; },
    setLoading: (loading: boolean) => {
      loadingBar.classList.toggle("s-active", loading);
    },
    updateRecordHudTrack: (info: string, synced: boolean) => recordHud.updateTrack(info, synced),
    refreshRecordHud: () => recordHud.update(),
    showRecordHud: () => recordHud.showRecord(),
    showClearWave: () => {
        clearWave.classList.remove("s-animate");
        void clearWave.offsetWidth; // trigger reflow
        clearWave.classList.add("s-animate");
    },
    applyAccentColor,
    resetFollow: () => {
        isAutoFollowEnabled = true;
        lastLyricsKey = ""; // Also force a full DOM rebuild for the new song
        scrollInner.scrollTop = 0;
    },
    setIgnoreScroll: (ignore: boolean) => {
        ignoreProgrammaticScroll = ignore;
    },
    render: (miniOpen: boolean) => {
      isMiniOpen = miniOpen;
      const settings = (window as any).lyrify_settings || {};
      debugInfo.style.display = settings.showDebug ? "block" : "none";

      if (isMiniOpen) {
          linesEl.innerHTML = "";
          const msg = h("div", { style: { textAlign: "center", padding: "40px 20px", opacity: "0.6", fontSize: "16px" } }, "Текст доступен в компактном окне.");
          linesEl.appendChild(msg);
          jumpNowBtn.style.display = "none";
          lastLyricsKey = "mini";
          return;
      }

      const lyrics = state.getLyrics();
      const activeIdx = state.getActiveIndex();
      const recordIdx = options.manual.isRecording() ? options.manual.getCurrentIndex() : null;
      const lyricsKey = `${lyrics.trackKey}-${lyrics.lines.length}`;

      // Auto-hide loading bar when lyrics are available
      if (lyrics.lines.length > 0) {
        loadingBar.classList.remove("s-active");
      }

      if (lyrics.authorNickname) {
          meta.textContent = `Синхронизировано: @${lyrics.authorNickname}`;
      } else {
          meta.textContent = "";
      }

      if (lyricsKey !== lastLyricsKey) {
          linesEl.innerHTML = "";
          linesEl.classList.toggle("s-synced", lyrics.synced);
          linesEl.classList.toggle("s-unsynced", !lyrics.synced);

          lyrics.lines.forEach((l, i) => {
            const div = h("div", {
              className: "lyrify-line",
              onclick: () => {
                isAutoFollowEnabled = true; // RE-ATTACH ON CLICK
                ignoreProgrammaticScroll = true;
                div.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => { ignoreProgrammaticScroll = false; }, 1000);

                if (l.startTime !== null) (window as any).Spicetify.Player.seek(l.startTime);
              }
            }, l.text);
            linesEl.appendChild(div);
          });
          
          lastLyricsKey = lyricsKey;
          scrollInner.scrollTop = 0;
      }

      // Handle Request Sync visibility and animation
      const shouldShowReq = !isMiniOpen && !lyrics.synced && lyrics.lines.length > 0 && lyrics.trackKey && lyrics.trackKey !== "none";
      if (shouldShowReq) {
          reqSyncBtn.classList.add("s-visible");
          reqSyncBtn.onclick = () => {
              if (reqSyncBtn.classList.contains("s-success")) return;
              
              reqSyncBtn.classList.add("s-success");
              reqSyncBtn.textContent = "✓ Requested";
              
              const spc = (window as any).Spicetify.Player;
              const tInfo = spc.data?.track?.metadata || {};
              const fallbackArtist = spc.data?.item?.artists?.map((a:any)=>a.name).join(", ");
              const artist = tInfo.artist_name || fallbackArtist || "Unknown Artist";
              const title = tInfo.title || spc.data?.item?.name || "Unknown Track";
              
              fetch("https://lyrify-api.aquashield.lol/request-sync", {
                  method: "POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ trackKey: lyrics.trackKey, artist, title })
              }).catch(()=>{});

              setTimeout(() => {
                  reqSyncBtn.classList.add("s-fade-out");
                  setTimeout(() => {
                      reqSyncBtn.classList.remove("s-visible", "s-success", "s-fade-out");
                      reqSyncBtn.textContent = "Request Sync";
                  }, 400);
              }, 2000);
          };
      } else {
          reqSyncBtn.classList.remove("s-visible", "s-success", "s-fade-out");
          reqSyncBtn.textContent = "Request Sync";
      }

      // Efficient class updates
      Array.from(linesEl.children).forEach((el, i) => {
          el.classList.toggle("s-active", i === activeIdx);
          el.classList.toggle("s-record", i === recordIdx);
      });

      updateJumpBtnVisibility();

      if (settings.autoScroll && isAutoFollowEnabled && activeIdx !== -1) {
          const activeNode = linesEl.children[activeIdx] as HTMLElement;
          if (activeNode && !options.manual.isRecording()) {
              // Always center the active node when it changes, or if it's far from center
              const rect = activeNode.getBoundingClientRect();
              const viewRect = scrollInner.getBoundingClientRect();
              const viewCenter = viewRect.top + viewRect.height / 2;
              const nodeCenter = rect.top + rect.height / 2;
              
              const isFarFromCenter = Math.abs(nodeCenter - viewCenter) > 50;

              if (isFarFromCenter) {
                  ignoreProgrammaticScroll = true;
                  activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => { ignoreProgrammaticScroll = false; }, 1000);
              }
          }
      }
    }
  };
}

function safeText(s: any) {
    return typeof s === "string" ? s.trim() : "";
}
