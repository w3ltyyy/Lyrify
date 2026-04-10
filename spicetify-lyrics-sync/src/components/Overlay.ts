import { state } from "../state";
import { h } from "../domUtils";
import { extractDominantColorFromImage, debounceByAnimationFrame } from "../utils";
import { createSettingsPanel } from "./SettingsPanel";
import { createRecordHud } from "./RecordHud";
import { ManualSyncController } from "../manualSync";

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
  
  const headerRight = h("div", { id: "lyrify-header-right" });
  const miniBtn = h("button", { id: "lyrify-mini-toggle" }, "Mini");
  const settingsBtn = h("button", { id: "lyrify-settings-toggle", title: "Display settings" }, "⚙");
  
  headerRight.appendChild(miniBtn);
  headerRight.appendChild(settingsBtn);
  header.appendChild(headerTitleEl);
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
  scrollInner.appendChild(jumpNowBtn);
  scrollWrap.appendChild(scrollInner);
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

  card.appendChild(loadingBar);
  card.appendChild(header);
  card.appendChild(settingsPanel.element);
  card.appendChild(body);
  overlay.appendChild(vibrantBg); // Blobs are behind the card
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
