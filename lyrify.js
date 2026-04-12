"use strict";
(() => {
  // src/state.ts
  var LS_KEYS = {
    FONT: "lyrify_ui_font_px",
    BLUR: "lyrify_ui_blur_px",
    BRIGHT: "lyrify_ui_brightness",
    AUTO: "lyrify_ui_auto_scroll",
    DEBUG: "lyrify_ui_show_debug",
    FULLSCREEN: "lyrify_ui_fullscreen",
    LINE_GAP: "lyrify_ui_line_gap",
    MAX_W: "lyrify_ui_max_width",
    INACTIVE_OP: "lyrify_ui_inactive_op_pct",
    EDGE_FADE: "lyrify_ui_edge_fade",
    MINI_X: "lyrify_mini_x",
    MINI_Y: "lyrify_mini_y",
    HUD_X: "lyrify_record_hud_x",
    HUD_Y: "lyrify_record_hud_y",
    AUTHOR_ID: "lyrify_author_id",
    VIBRANT: "lyrify_ui_vibrant",
    HIGHLIGHT_ACTIVE: "lyrify_ui_highlight_active"
  };
  var DEFAULT_SETTINGS = {
    fontPx: 35,
    blurPx: 0,
    brightness: 1,
    autoScroll: true,
    showDebug: false,
    fullscreen: true,
    lineGapPx: 14,
    maxWidthPx: 720,
    inactiveOpacityPct: 38,
    edgeFade: true,
    nickname: "",
    vibrant: false,
    highlightActive: true
  };
  var StateManager = class {
    constructor() {
      this.lyrics = { trackKey: "", lines: [], synced: false };
      this.activeIndex = -1;
      this.settings = { ...DEFAULT_SETTINGS };
      this.listeners = /* @__PURE__ */ new Set();
      this.loadSettings();
    }
    loadSettings() {
      try {
        this.settings = {
          fontPx: Math.min(52, Math.max(22, Number(localStorage.getItem(LS_KEYS.FONT) || "35") || 35)),
          blurPx: Math.min(16, Math.max(0, Number(localStorage.getItem(LS_KEYS.BLUR) || "0") || 0)),
          brightness: Math.min(1.35, Math.max(0.75, Number(localStorage.getItem(LS_KEYS.BRIGHT) || "1") || 1)),
          autoScroll: localStorage.getItem(LS_KEYS.AUTO) !== "0",
          showDebug: localStorage.getItem(LS_KEYS.DEBUG) === "1",
          fullscreen: localStorage.getItem(LS_KEYS.FULLSCREEN) !== "0",
          lineGapPx: Math.min(28, Math.max(8, Number(localStorage.getItem(LS_KEYS.LINE_GAP) || "14") || 14)),
          maxWidthPx: Math.min(960, Math.max(480, Number(localStorage.getItem(LS_KEYS.MAX_W) || "720") || 720)),
          inactiveOpacityPct: Math.min(55, Math.max(15, Number(localStorage.getItem(LS_KEYS.INACTIVE_OP) || "38") || 38)),
          edgeFade: localStorage.getItem(LS_KEYS.EDGE_FADE) !== "0",
          nickname: localStorage.getItem("lyrify_contributor_nickname") || "",
          vibrant: localStorage.getItem(LS_KEYS.VIBRANT) === "1",
          highlightActive: localStorage.getItem(LS_KEYS.HIGHLIGHT_ACTIVE) !== "0"
        };
      } catch (e) {
        this.settings = { ...DEFAULT_SETTINGS };
      }
    }
    saveSettings(newSettings) {
      Object.assign(this.settings, newSettings);
      try {
        if (newSettings.fontPx !== void 0) localStorage.setItem(LS_KEYS.FONT, String(newSettings.fontPx));
        if (newSettings.blurPx !== void 0) localStorage.setItem(LS_KEYS.BLUR, String(newSettings.blurPx));
        if (newSettings.brightness !== void 0) localStorage.setItem(LS_KEYS.BRIGHT, String(newSettings.brightness));
        if (newSettings.autoScroll !== void 0) localStorage.setItem(LS_KEYS.AUTO, newSettings.autoScroll ? "1" : "0");
        if (newSettings.showDebug !== void 0) localStorage.setItem(LS_KEYS.DEBUG, newSettings.showDebug ? "1" : "0");
        if (newSettings.fullscreen !== void 0) localStorage.setItem(LS_KEYS.FULLSCREEN, newSettings.fullscreen ? "1" : "0");
        if (newSettings.lineGapPx !== void 0) localStorage.setItem(LS_KEYS.LINE_GAP, String(newSettings.lineGapPx));
        if (newSettings.maxWidthPx !== void 0) localStorage.setItem(LS_KEYS.MAX_W, String(newSettings.maxWidthPx));
        if (newSettings.inactiveOpacityPct !== void 0) localStorage.setItem(LS_KEYS.INACTIVE_OP, String(newSettings.inactiveOpacityPct));
        if (newSettings.edgeFade !== void 0) localStorage.setItem(LS_KEYS.EDGE_FADE, newSettings.edgeFade ? "1" : "0");
        if (newSettings.nickname !== void 0) localStorage.setItem("lyrify_contributor_nickname", newSettings.nickname);
        if (newSettings.vibrant !== void 0) localStorage.setItem(LS_KEYS.VIBRANT, newSettings.vibrant ? "1" : "0");
        if (newSettings.highlightActive !== void 0) localStorage.setItem(LS_KEYS.HIGHLIGHT_ACTIVE, newSettings.highlightActive ? "1" : "0");
      } catch (e) {
      }
      this.notify();
    }
    getLyrics() {
      return this.lyrics;
    }
    setLyrics(lyrics) {
      this.lyrics = lyrics;
      this.notify();
    }
    getActiveIndex() {
      return this.activeIndex;
    }
    setActiveIndex(index) {
      if (this.activeIndex === index) return;
      this.activeIndex = index;
      this.notify();
    }
    getSettings() {
      return this.settings;
    }
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
    notify() {
      this.listeners.forEach((l) => l());
    }
  };
  var state = new StateManager();

  // src/styles.ts
  var CSS_ID = "lyrify-lyrics-sync-styles";
  var STYLES = `
    #lyrify-host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 30;
    }
    #lyrify-overlay {
      position: absolute;
      z-index: 1;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      color: #ffffff;
      pointer-events: auto;
      overflow: hidden;
      transition: background 0.6s ease;
      background: var(--lyrify-bg, #121212);
    }
    #lyrify-overlay.s-split-view {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 99999;
    }
    #lyrify-vibrant-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: -1;
      display: none;
      filter: blur(140px);
      transition: opacity 0.8s ease;
      background: #121212;
      pointer-events: none;
      contain: layout paint;
    }
    #lyrify-overlay.s-vibrant-enabled {
      background: #000;
    }
    #lyrify-overlay.s-vibrant-enabled #lyrify-vibrant-bg {
      display: block;
      opacity: 0.65;
    }
    #lyrify-overlay.s-vibrant-enabled #lyrify-card {
      background: rgba(18,18,18, 0.65);
      backdrop-filter: blur(48px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .lyrify-blob {
      position: absolute;
      width: min(100vh, 800px);
      height: min(100vh, 800px);
      border-radius: 50%;
      opacity: 0.65;
      filter: blur(110px);
      will-change: transform, background;
      transition: background 2s ease;
    }
    .lyrify-blob-0 { background: var(--lyrify-color-1, #1db954); top: -10%; left: -10%; animation: lyrify-drift-1 25s infinite alternate ease-in-out; }
    .lyrify-blob-1 { background: var(--lyrify-color-2, #18ac4b); top: -10%; right: -10%; animation: lyrify-drift-2 30s infinite alternate ease-in-out; }
    .lyrify-blob-2 { background: var(--lyrify-color-3, #159341); bottom: -10%; left: -10%; animation: lyrify-drift-3 28s infinite alternate ease-in-out; }
    .lyrify-blob-3 { background: var(--lyrify-color-4, #12823a); bottom: -10%; right: -10%; animation: lyrify-drift-4 32s infinite alternate ease-in-out; }

    @keyframes lyrify-drift-1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(25%, 20%) scale(1.1); }
    }
    @keyframes lyrify-drift-2 {
      0% { transform: translate(0, 0) scale(1.1); }
      100% { transform: translate(-20%, 25%) scale(1); }
    }
    @keyframes lyrify-drift-3 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(20%, -25%) scale(1.15); }
    }
    @keyframes lyrify-drift-4 {
      0% { transform: translate(0, 0) scale(1.1); }
      100% { transform: translate(-25%, -20%) scale(1); }
    }
    #lyrify-card {
      width: 100%;
      height: 100%;
      max-height: none;
      display: flex;
      flex-direction: column;
      background: var(--lyrify-card-bg, #121212);
      border-radius: 0;
      border: none;
      overflow: hidden;
      box-shadow: none;
      filter: brightness(var(--lyrify-brightness, 1));
      transition: flex-direction 0.4s;
    }
    #lyrify-overlay.s-split-view #lyrify-card {
      flex-direction: row;
    }
    #lyrify-left-panel {
      display: none;
      flex: 0 0 45%;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      box-sizing: border-box;
      background: transparent;
      border: none;
    }
    #lyrify-overlay.s-split-view #lyrify-left-panel {
      display: flex;
      animation: lyrify-left-in 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .lyrify-right-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      position: relative;
    }
    @keyframes lyrify-left-in {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    #lyrify-fs-cover-wrap {
      position: relative;
      width: 100%;
      max-width: 380px;
      aspect-ratio: 1;
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    }
    #lyrify-fs-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    #lyrify-fs-cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 32px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #lyrify-fs-cover-wrap:hover #lyrify-fs-cover-overlay {
      opacity: 1;
    }
    #lyrify-fs-title {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      text-align: center;
      margin-top: 16px;
      margin-bottom: 2px;
      width: 100%;
      word-break: break-word;
    }
    #lyrify-fs-artist {
      font-size: 16px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      width: 100%;
      margin-bottom: 24px;
    }
    #lyrify-fs-seek {
      width: 100%;
      max-width: 420px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #lyrify-fs-seek .lyrify-fs-time {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      font-variant-numeric: tabular-nums;
      width: 36px;
      text-align: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #lyrify-fs-seek:hover .lyrify-fs-time {
      opacity: 1;
    }
    #lyrify-fs-seek input[type="range"] {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      appearance: none;
      background: linear-gradient(to right, rgba(255, 255, 255, 0.9) var(--progress, 0%), rgba(255, 255, 255, 0.2) var(--progress, 0%));
      cursor: pointer;
    }
    #lyrify-fs-seek input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 0;
      height: 0;
      opacity: 0;
      pointer-events: none;
    }
    .lyrify-fs-btn {
      background: none;
      border: none;
      padding: 0;
      outline: none;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.2s;
    }
    .lyrify-fs-btn:hover {
      color: #fff;
      transform: scale(1.1);
    }
    .lyrify-fs-btn svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }
    .lyrify-fs-btn.s-play {
      color: #fff;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lyrify-fs-btn.s-play:hover {
      transform: scale(1.1);
    }
    .lyrify-fs-btn.s-play svg {
      width: 48px;
      height: 48px;
    }
    .lyrify-fs-exit-btn {
      position: absolute;
      top: 32px;
      right: 32px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100000;
      opacity: 0;
      transition: all 0.2s ease;
    }
    #lyrify-overlay.s-split-view .lyrify-fs-exit-btn {
      display: flex;
    }
    #lyrify-overlay.s-split-view.s-mouse-active .lyrify-fs-exit-btn,
    .lyrify-fs-exit-btn:hover {
      opacity: 1 !important;
      pointer-events: auto;
    }

    /* Request Sync Button */
    .lyrify-req-sync-btn {
      position: relative;
      margin-left: 14px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.85);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 50;
      opacity: 0;
      pointer-events: none;
      display: none;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    .lyrify-req-sync-btn.s-visible {
      opacity: 1;
      pointer-events: auto;
      display: inline-flex;
    }
    .lyrify-req-sync-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    .lyrify-req-sync-btn.s-success {
      background: rgba(30, 215, 96, 0.4);
      border-color: rgba(30, 215, 96, 0.8);
      color: #fff;
    }
    .lyrify-req-sync-btn.s-fade-out {
      opacity: 0;
      transform: scale(0.9);
    }
    .lyrify-fs-exit-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
    .lyrify-fs-exit-btn svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    
    #lyrify-overlay.s-split-view #lyrify-header {
      display: none !important;
    }
    #lyrify-overlay.s-split-view #lyrify-scroll-inner {
      mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%);
    }
    #lyrify-overlay.s-split-view #lyrify-scroll-inner.s-no-mask-top {
      mask-image: linear-gradient(to bottom, black 0%, black 65%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 0%, black 65%, transparent 100%);
    }
    #lyrify-overlay.s-split-view #lyrify-scroll-inner.s-no-mask-bottom {
      mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 100%);
    }
    #lyrify-overlay.s-split-view #lyrify-scroll-inner.s-no-mask-top.s-no-mask-bottom {
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }
    #lyrify-loading-bar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      z-index: 100;
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    #lyrify-loading-bar.s-active {
      opacity: 1;
    }
    #lyrify-loading-bar-inner {
      position: absolute;
      top: 0; left: -60%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, var(--lyrify-accent-strong, #1db954) 50%, transparent 100%);
      animation: lyrify-loading-slide 1.4s ease-in-out infinite;
    }
    @keyframes lyrify-loading-slide {
      0%   { left: -60%; }
      100% { left: 120%; }
    }
    #lyrify-mini {
      position: fixed;
      right: 20px;
      bottom: 100px;
      width: min(460px, calc(100vw - 32px));
      height: 400px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(18, 18, 18, 0.72);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(28px);
      z-index: 99999;
      pointer-events: auto;
      display: none;
      overflow: hidden;
      transform: translateY(18px) scale(0.97);
      opacity: 0;
      transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    #lyrify-mini.s-open {
      display: block;
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    #lyrify-mini.s-open {
      display: block;
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    
    #lyrify-mini-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: grab;
      user-select: none;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.85);
    }
    #lyrify-mini-body {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: calc(100% - 46px);
      box-sizing: border-box;
    }
    .lyrify-mini-info {
        text-align: center;
        font-size: 11.5px;
        font-weight: 600;
        opacity: 0.75;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    #lyrify-mini-line {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #lyrify-mini-scroll {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 11px;
      padding-right: 2px;
      mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
    }
    .lyrify-mini-line {
      font-size: 18px;
      line-height: 1.35;
      font-weight: 700;
      opacity: 0.28;
      transform: scale(0.96);
      transition:
        opacity 460ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 480ms cubic-bezier(0.22, 1, 0.36, 1),
        background-color 340ms ease;
      border-radius: 12px;
      padding: 6px 12px;
      cursor: pointer;
      text-align: center;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .lyrify-mini-line.s-active {
      opacity: 1;
      transform: scale(1.08);
      background: var(--lyrify-line-active-bg, rgba(30, 215, 96, 0.22));
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
      font-size: 26px;
      font-weight: 800;
      color: #fff;
    }
    .lyrify-mini-line.s-prev,
    .lyrify-mini-line.s-next {
      opacity: 0.45;
    }
    #lyrify-mini-scroll.s-enter-up .lyrify-mini-line {
      opacity: 0;
      transform: translateY(16px) scale(0.96);
    }
    #lyrify-mini-scroll.s-enter-down .lyrify-mini-line {
      opacity: 0;
      transform: translateY(-16px) scale(0.96);
    }
    #lyrify-mini-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }
    #lyrify-mini-seek {
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    #lyrify-mini-seek input[type="range"] {
      width: 100%;
      appearance: none;
      -webkit-appearance: none;
      height: 14px;
      background: transparent;
      cursor: pointer;
    }
    #lyrify-mini-seek input[type="range"]::-webkit-slider-runnable-track {
      height: 3px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--lyrify-accent-strong, #1db954) 48%, #ffffff 12%);
      opacity: 0.9;
    }
    #lyrify-mini-seek input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.22);
      margin-top: -3.5px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
    }
    #lyrify-mini-seek input[type="range"]::-moz-range-track {
      height: 3px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--lyrify-accent-strong, #1db954) 48%, #ffffff 12%);
      opacity: 0.9;
    }
    #lyrify-mini-seek input[type="range"]::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.22);
    }
    .lyrify-mini-time {
      font-size: 11px;
      opacity: 0.82;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    #lyrify-mini-jump {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 999px;
      background: #fff;
      color: #000;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 10;
      display: none;
      transition: transform 140ms ease, background-color 140ms ease;
    }
    #lyrify-mini-jump:hover {
        transform: scale(1.05);
        background: #f0f0f0;
    }
    .lyrify-mini-icon-btn {
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.95);
      transition: transform 180ms cubic-bezier(0.2, 1.2, 0.5, 1.2), background-color 220ms ease, border-color 220ms ease;
    }
    .lyrify-mini-icon-btn:hover {
      transform: translateY(-2px) scale(1.1);
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .lyrify-mini-icon-btn:active {
        transform: scale(0.94);
    }
    .lyrify-mini-icon-btn svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }
    .lyrify-mini-icon-btn.s-play {
        width: 52px;
        height: 52px;
        background: #fff;
        color: #000;
        border: none;
    }
    .lyrify-mini-icon-btn.s-play:hover {
        background: #f0f0f0;
        transform: translateY(-2px) scale(1.08);
    }
    .lyrify-mini-icon-btn.s-play svg {
        width: 24px;
        height: 24px;
    }
    @keyframes lyrifyMiniPulse {
      0% { box-shadow: inset 0 0 0 rgba(255,255,255,0); }
      50% { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
      100% { box-shadow: inset 0 0 0 rgba(255,255,255,0); }
    }
    .lyrify-mini-header-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.45);
      cursor: pointer;
      transition: all 180ms ease;
      padding: 0;
    }
    .lyrify-mini-header-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      transform: scale(1.05);
    }
    .lyrify-mini-header-btn.s-active {
        color: var(--lyrify-accent-strong, #1db954);
    }
    .lyrify-mini-header-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    #lyrify-header {
      flex-shrink: 0;
      padding: 14px 16px 12px;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    #lyrify-header-right {
      display: inline-flex;
      gap: 10px;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 auto;
    }
    #lyrify-title {
      font-weight: 700;
      font-size: 12.5px;
      line-height: 1.2;
      opacity: 0.95;
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #lyrify-settings-toggle, #lyrify-splitview-toggle {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 14px;
      line-height: 1;
    }
    #lyrify-mini-toggle {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 12px;
      line-height: 1;
    }
    #lyrify-mini-toggle.s-active {
      background: var(--lyrify-accent-soft, rgba(30,215,96,0.16));
      border-color: var(--lyrify-accent-border, rgba(30,215,96,0.55));
      color: var(--lyrify-accent-text, #d8ffe7);
    }
    #lyrify-close {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 12px;
    }
    #lyrify-body {
      padding: 12px 16px 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      position: relative;
    }
    #lyrify-settings-panel {
      position: absolute;
      top: 54px;
      right: 12px;
      width: min(420px, calc(100% - 24px));
      display: none;
      padding: 12px 12px;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px;
      background: rgba(18,18,18,0.92);
      box-shadow: 0 18px 64px rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
      z-index: 12;
      max-height: min(78vh, 640px);
      overflow: hidden;
    }
    #lyrify-settings-panel.s-open {
      display: flex;
    }
    #lyrify-settings-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 4px 8px;
      font-weight: 700;
      font-size: 12.5px;
      opacity: 0.95;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      margin-bottom: 6px;
    }
    #lyrify-settings-close {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 6px 9px;
      font-size: 12px;
      line-height: 1;
    }
    #lyrify-settings-section {
      padding: 2px 4px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #lyrify-settings-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 0 2px 2px;
      scrollbar-width: thin;
    }
    .lyrify-settings-cat-btn {
      cursor: pointer;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 6px 10px;
      font-size: 11.5px;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    .lyrify-settings-cat-btn.is-active {
      background: var(--lyrify-accent-soft, rgba(30, 215, 96, 0.16));
      border-color: var(--lyrify-accent-border, rgba(30, 215, 96, 0.55));
      color: var(--lyrify-accent-text, #d8ffe7);
    }
    #lyrify-settings-content {
      overflow-y: auto;
      min-height: 0;
      padding-right: 2px;
    }
    .lyrify-settings-category {
      padding-top: 2px;
      margin-top: 2px;
      border-top: 1px dashed rgba(255,255,255,0.08);
    }
    .lyrify-settings-subtitle {
      margin-top: 4px;
      font-size: 11.5px;
      font-weight: 700;
      opacity: 0.85;
      letter-spacing: 0.01em;
    }
    .lyrify-setting-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .lyrify-setting-row:last-child {
      margin-bottom: 0;
    }
    .lyrify-setting-row label {
      min-width: 120px;
      opacity: 0.85;
      font-weight: 500;
      font-size: 12.5px;
    }
    .lyrify-setting-row input[type="range"] {
      flex: 1;
      min-width: 120px;
      max-width: 220px;
    }
    .lyrify-setting-row input[type="checkbox"] {
      width: 16px;
      height: 16px;
      margin: 0;
      cursor: pointer;
      transform: translateY(1px);
    }
    .lyrify-setting-text {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      font-family: inherit;
      font-size: 11px;
      padding: 5px 8px;
      outline: none;
      transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
      width: 120px;
      text-align: right;
    }
    .lyrify-setting-text:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .lyrify-setting-text:focus {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--lyrify-accent-strong, #1db954);
      box-shadow: 0 0 0 3px rgba(30, 215, 96, 0.12);
      width: 140px;
    }
    .lyrify-setting-val {
      min-width: 38px;
      text-align: right;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      opacity: 0.9;
      font-size: 11px;
    }
    #lyrify-scroll-wrap {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-top: 4px;
    }
    #lyrify-scroll-wrap.s-fade-disabled #lyrify-scroll-inner {
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }
    #lyrify-scroll-inner {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 4px 24px;
      scrollbar-width: none;
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      transition: mask-image 0.2s ease, -webkit-mask-image 0.2s ease;
    }
    #lyrify-scroll-inner::-webkit-scrollbar {
      display: none;
    }
    #lyrify-scroll-inner.s-no-mask-top {
      mask-image: linear-gradient(to bottom, black 0%, black 85%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 0%, black 85%, transparent 100%);
    }
    #lyrify-scroll-inner.s-no-mask-bottom {
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
    }
    #lyrify-scroll-inner.s-no-mask-top.s-no-mask-bottom {
      mask-image: none;
      -webkit-mask-image: none;
    }
    #lyrify-lines {
      display: flex;
      flex-direction: column;
      gap: var(--lyrify-lines-gap, 14px);
      margin: 4px auto 0;
      max-width: min(var(--lyrify-lines-max-width, 720px), 100%);
    }
    .lyrify-line {
      font-size: var(--lyrify-line-font-size, 35px);
      font-weight: 700;
      line-height: 1.12;
      letter-spacing: -0.01em;
      padding: 4px 4px;
      border-radius: 10px;
      opacity: var(--lyrify-line-dim-opacity, 0.38);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      transform: translateY(5px) scale(0.985);
      transition: opacity 220ms ease, transform 260ms ease, background-color 260ms ease, text-decoration 220ms ease;
    }
    #lyrify-lines.s-unsynced .lyrify-line {
      opacity: 0.95;
      transform: translateY(0) scale(1);
      cursor: default;
    }
    #lyrify-lines.s-synced .lyrify-line:hover {
      opacity: 0.85;
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
      text-decoration-color: var(--lyrify-accent-soft, rgba(30,215,96,0.5));
    }
    #lyrify-lines.s-synced .lyrify-line.s-active:hover {
      opacity: 1;
    }
    .lyrify-line.s-active {
      opacity: 1;
      transform: translateY(0) scale(1.015);
      background: var(--lyrify-line-active-bg, rgba(255,255,255,0.08));
    }
    #lyrify-overlay:not(.s-highlight-enabled) .lyrify-line.s-active {
      background: transparent;
      transform: none;
    }
    .lyrify-line.s-record {
      opacity: 1;
      background: rgba(255,255,255,0.08);
    }
    .lyrify-btn {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 8px 10px;
      font-size: 12px;
      transition: all 0.2s ease;
    }
    .lyrify-btn:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-1px);
    }
    .lyrify-btn-clear {
      background: rgba(255, 100, 100, 0.1);
      border-color: rgba(255, 100, 100, 0.25);
      color: #ff8e8e;
      margin-top: 10px;
      width: 100%;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .lyrify-btn-clear:hover {
      background: rgba(255, 100, 100, 0.2);
      border-color: rgba(255, 100, 100, 0.4);
    }
    .lyrify-puff-anim {
      animation: lyrify-puff 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes lyrify-puff {
      0% { transform: scale(1); filter: brightness(1) blur(0); }
      30% { transform: scale(1.05); filter: brightness(2) blur(2px); }
      100% { transform: scale(1); filter: brightness(1) blur(0); }
    }
    .lyrify-wave-clear {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
      pointer-events: none;
      z-index: 100;
      opacity: 0;
    }
    .lyrify-wave-active {
      animation: lyrify-wave 0.8s ease-out forwards;
    }
    @keyframes lyrify-wave {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
    .lyrify-btn[disabled] {
      opacity: 0.55;
      cursor: default;
    }
    #lyrify-meta {
      font-size: 11.5px;
      opacity: 0.72;
      margin-bottom: 8px;
      white-space: pre-wrap;
    }
    #lyrify-jump-now {
      position: absolute;
      bottom: 24px;
      right: 24px;
      z-index: 50;
      border-radius: 999px;
      background: var(--lyrify-accent-soft, rgba(30, 215, 96, 0.16));
      border: 1px solid var(--lyrify-accent-border, rgba(30, 215, 96, 0.55));
      color: var(--lyrify-accent-text, #d8ffe7);
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    #lyrify-inline-trigger {
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(255,255,255,0.95);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 8px;
      padding: 0;
      opacity: 0.85;
      pointer-events: auto;
      position: relative;
      z-index: 9999;
    }
    #lyrify-inline-trigger:hover {
      color: #ffffff;
      opacity: 1;
    }
    #lyrify-inline-trigger.s-active {
      color: var(--lyrify-accent-strong, rgba(30,215,96,1));
      opacity: 1;
    }
    #lyrify-inline-trigger svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: currentColor;
    }
    #lyrify-record-hud {
      position: fixed;
      left: 18px;
      bottom: 90px;
      width: min(420px, calc(100vw - 36px));
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(18,18,18,0.92);
      box-shadow: 0 18px 64px rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
      z-index: 9999;
      pointer-events: auto;
      display: none;
      overflow: hidden;
    }
    #lyrify-record-hud.s-open {
      display: block;
    }
    #lyrify-record-hud-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      cursor: grab;
      user-select: none;
      font-weight: 700;
      font-size: 11.5px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.6);
    }
    #lyrify-record-hud-track {
      font-size: 10px;
      opacity: 0.45;
      padding: 8px 14px 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #lyrify-record-hud-status {
      font-size: 9px;
      font-weight: 700;
      padding: 0 14px 8px;
      text-transform: uppercase;
      opacity: 0.8;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    #lyrify-record-hud-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #lyrify-record-hud-line {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      min-height: 42px;
      display: flex;
      align-items: center;
    }
    #lyrify-record-hud-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    #lyrify-record-hud-counter {
      font-size: 10px;
      opacity: 0.35;
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    #lyrify-record-hud-toast {
      position: absolute;
      bottom: 12px;
      left: 14px;
      font-size: 9px;
      font-weight: 800;
      color: var(--lyrify-accent-strong, #1db954);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #lyrify-record-hud-toast.s-show {
      opacity: 1;
    }
    #lyrify-record-hud-hint {
      font-size: 9px;
      opacity: 0.25;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    #lyrify-record-hud-list {
      max-height: 80px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
    }
    .lyrify-record-hud-item {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 9.5px;
      padding: 4px 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .lyrify-record-hud-item:hover {
      background: rgba(255,255,255,0.06);
    }
    .lyrify-mini-header-btn {
      background: none;
      border: none;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: rgba(255,255,255,0.4);
      border-radius: 50%;
      transition: all 0.2s;
    }
    .lyrify-mini-header-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .lyrify-mini-header-btn svg {
      width: 14px;
      height: 14px;
    }
    .lyrify-record-hud-item-time {
      color: var(--lyrify-accent-strong, #1db954);
      font-weight: 700;
    }
    #lyrify-record-hud-toast {
      position: absolute;
      bottom: 12px;
      left: 14px;
      font-size: 9px;
      font-weight: 800;
      color: var(--lyrify-accent-strong, #1db954);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #lyrify-record-hud-toast.s-show {
      opacity: 1;
    }
`;

  // src/domUtils.ts
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, val] of Object.entries(props)) {
      if (key === "style" && typeof val === "object") {
        Object.assign(el.style, val);
      } else if (key.startsWith("on") && typeof val === "function") {
        const event = key.toLowerCase().substring(2);
        el.addEventListener(event, val);
      } else if (key === "className") {
        el.className = val;
      } else if (key === "classList" && Array.isArray(val)) {
        el.classList.add(...val.filter(Boolean));
      } else if (key === "dataset" && typeof val === "object") {
        Object.assign(el.dataset, val);
      } else {
        el[key] = val;
      }
    }
    const addChildren = (childList) => {
      for (const child of childList) {
        if (child === null || child === void 0) continue;
        if (Array.isArray(child)) {
          addChildren(child);
        } else if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          el.appendChild(child);
        }
      }
    };
    addChildren(children);
    return el;
  }
  function hSvg(tag, props = {}, ...children) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, val] of Object.entries(props)) {
      if (key === "className") {
        el.setAttribute("class", val);
      } else if (key === "style" && typeof val === "object") {
        Object.assign(el.style, val);
      } else {
        el.setAttribute(key, String(val));
      }
    }
    const addChildren = (childList) => {
      for (const child of childList) {
        if (child === null || child === void 0) continue;
        if (Array.isArray(child)) {
          addChildren(child);
        } else if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
          el.appendChild(child);
        }
      }
    };
    addChildren(children);
    return el;
  }

  // src/utils.ts
  function debounceByAnimationFrame(fn) {
    let scheduled = false;
    return () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        try {
          fn();
        } catch (e) {
        }
      });
    };
  }
  async function extractDominantColorFromImage(imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      const loaded = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image load failed"));
      });
      img.src = imageUrl;
      await loaded;
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 30) continue;
        const pr = data[i];
        const pg = data[i + 1];
        const pb = data[i + 2];
        if (pr + pg + pb < 45) continue;
        r += pr;
        g += pg;
        b += pb;
        count++;
      }
      if (!count) return null;
      const dominant = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
      };
      const palette = [];
      const samples = [
        { x: 4, y: 4 },
        { x: size - 4, y: 4 },
        { x: 4, y: size - 4 },
        { x: size - 4, y: size - 4 },
        { x: size / 2, y: size / 2 }
      ];
      samples.forEach((s) => {
        const off = (Math.floor(s.y) * size + Math.floor(s.x)) * 4;
        if (data[off + 3] > 128) {
          palette.push({ r: data[off], g: data[off + 1], b: data[off + 2] });
        }
      });
      return { dominant, palette };
    } catch (e) {
      return null;
    }
  }
  function formatMs(ms) {
    const s = Math.max(0, Math.floor(ms / 1e3));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${String(ss).padStart(2, "0")}`;
  }
  var AUTHOR_ID_KEY = "lyrify_author_id";
  function getOrCreateAuthorId() {
    let id = localStorage.getItem(AUTHOR_ID_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(AUTHOR_ID_KEY, id);
    }
    return id;
  }
  function generateRandomNickname() {
    const adj = ["Shiny", "Golden", "Swift", "Quiet", "Bold", "Lively", "Wild", "Frosty", "Misty", "Vibrant", "Kind", "Cool", "Epic", "Magic", "Solar", "Lunar", "Super", "Elite", "Grand", "Cosmic"];
    const nouns = ["Panda", "Fox", "Eagle", "Wolf", "Tiger", "Bear", "Owl", "Deer", "Lynx", "Falcon", "Koala", "Otter", "Lion", "Shark", "Raven", "Dolphin", "Phoenix", "Leopard", "Cobra", "Dragon"];
    const a = adj[Math.floor(Math.random() * adj.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    return `${a} ${n}`;
  }

  // src/components/SettingsPanel.ts
  var LS_UI_FONT = "lyrify_ui_font_px";
  var LS_UI_BLUR = "lyrify_ui_blur_px";
  var LS_UI_BRIGHT = "lyrify_ui_brightness";
  var LS_UI_AUTO = "lyrify_ui_auto_scroll";
  var LS_UI_DEBUG = "lyrify_ui_show_debug";
  var LS_UI_LINE_GAP = "lyrify_ui_line_gap";
  var LS_UI_MAX_W = "lyrify_ui_max_width";
  var LS_UI_INACTIVE_OP = "lyrify_ui_inactive_op_pct";
  var LS_UI_EDGE_FADE = "lyrify_ui_edge_fade";
  var LS_UI_VIBRANT = "lyrify_ui_vibrant";
  var LS_UI_HIGHLIGHT_ACTIVE = "lyrify_ui_highlight_active";
  var LS_CONTRIBUTOR_NICKNAME = "lyrify_contributor_nickname";
  function readUiSettings() {
    return {
      fontPx: Math.min(52, Math.max(22, Number(localStorage.getItem(LS_UI_FONT) || "35") || 35)),
      blurPx: Math.min(16, Math.max(0, Number(localStorage.getItem(LS_UI_BLUR) || "0") || 0)),
      brightness: Math.min(1.35, Math.max(0.75, Number(localStorage.getItem(LS_UI_BRIGHT) || "1") || 1)),
      autoScroll: localStorage.getItem(LS_UI_AUTO) !== "0",
      showDebug: localStorage.getItem(LS_UI_DEBUG) === "1",
      lineGapPx: Math.min(28, Math.max(8, Number(localStorage.getItem(LS_UI_LINE_GAP) || "14") || 14)),
      maxWidthPx: Math.min(960, Math.max(480, Number(localStorage.getItem(LS_UI_MAX_W) || "720") || 720)),
      inactiveOpacityPct: Math.min(55, Math.max(15, Number(localStorage.getItem(LS_UI_INACTIVE_OP) || "38") || 38)),
      edgeFade: localStorage.getItem(LS_UI_EDGE_FADE) !== "0",
      vibrant: localStorage.getItem(LS_UI_VIBRANT) === "1",
      highlightActive: localStorage.getItem(LS_UI_HIGHLIGHT_ACTIVE) !== "0",
      nickname: localStorage.getItem(LS_CONTRIBUTOR_NICKNAME) || ""
    };
  }
  function createSettingsPanel(targetOverlay, onClearCache, manualSync, onLayoutChange) {
    const panel = h("div", { id: "lyrify-settings-panel" });
    const title = h("div", { id: "lyrify-settings-title" }, "Display settings");
    const closeBtn = h("button", { id: "lyrify-settings-close", type: "button" }, "Close");
    title.appendChild(closeBtn);
    panel.appendChild(title);
    const nav = h("div", { id: "lyrify-settings-nav" });
    const content = h("div", { id: "lyrify-settings-content" });
    const sectionWrapper = h("div", { id: "lyrify-settings-section-wrapper" });
    content.appendChild(sectionWrapper);
    panel.appendChild(nav);
    panel.appendChild(content);
    const generalSection = h("div", { id: "lyrify-cat-general", className: "lyrify-settings-category" });
    const appearanceSection = h("div", { id: "lyrify-cat-appearance", className: "lyrify-settings-category" });
    const syncSection = h("div", { id: "lyrify-cat-sync", className: "lyrify-settings-category" });
    sectionWrapper.appendChild(generalSection);
    sectionWrapper.appendChild(appearanceSection);
    sectionWrapper.appendChild(syncSection);
    const row = (label, control, val) => {
      const r = h("div", { className: "lyrify-setting-row" });
      const l = h("label", {}, label);
      r.appendChild(l);
      r.appendChild(control);
      r.appendChild(val);
      return r;
    };
    const fontRange = h("input", { type: "range", min: "22", max: "52", step: "1" });
    const fontVal = h("span", { className: "lyrify-setting-val" });
    const blurRange = h("input", { type: "range", min: "0", max: "16", step: "1" });
    const blurVal = h("span", { className: "lyrify-setting-val" });
    const brightRange = h("input", { type: "range", min: "75", max: "135", step: "1" });
    const brightVal = h("span", { className: "lyrify-setting-val" });
    const autoScrollCb = h("input", { type: "checkbox" });
    const showDebugCb = h("input", { type: "checkbox" });
    const edgeFadeCb = h("input", { type: "checkbox" });
    const vibrantCb = h("input", { type: "checkbox" });
    const recordCb = h("input", { type: "checkbox" });
    const highlightActiveCb = h("input", { type: "checkbox" });
    const lineGapRange = h("input", { type: "range", min: "8", max: "28", step: "1" });
    const lineGapVal = h("span", { className: "lyrify-setting-val" });
    const maxWidthRange = h("input", { type: "range", min: "480", max: "960", step: "10" });
    const maxWidthVal = h("span", { className: "lyrify-setting-val" });
    const inactiveOpRange = h("input", { type: "range", min: "15", max: "55", step: "1" });
    const inactiveOpVal = h("span", { className: "lyrify-setting-val" });
    const nicknameInput = h("input", { type: "text", maxLength: "32", placeholder: "Anonymous", className: "lyrify-setting-text" });
    generalSection.appendChild(row("Text size", fontRange, fontVal));
    generalSection.appendChild(row("Background blur", blurRange, blurVal));
    generalSection.appendChild(row("Brightness", brightRange, brightVal));
    generalSection.appendChild(row("Auto-scroll", autoScrollCb, h("span")));
    generalSection.appendChild(row("Show debug", showDebugCb, h("span")));
    generalSection.appendChild(row("Contributor Nickname", nicknameInput, h("span")));
    appearanceSection.appendChild(h("div", { className: "lyrify-settings-subtitle" }, "Lyrics column"));
    appearanceSection.appendChild(row("Line spacing", lineGapRange, lineGapVal));
    appearanceSection.appendChild(row("Max width", maxWidthRange, maxWidthVal));
    appearanceSection.appendChild(row("Inactive dim", inactiveOpRange, inactiveOpVal));
    appearanceSection.appendChild(row("Edge fade", edgeFadeCb, h("span")));
    appearanceSection.appendChild(row("Vibrant backgrounds", vibrantCb, h("span")));
    appearanceSection.appendChild(row("Highlight active line", highlightActiveCb, h("span")));
    syncSection.appendChild(h("div", { className: "lyrify-settings-subtitle" }, "Sync engine"));
    if (manualSync) {
      syncSection.appendChild(row("Recording Mode", recordCb, h("span")));
    }
    const clearCacheBtn = h("button", {
      id: "lyrify-clear-cache",
      className: "lyrify-btn",
      style: { marginTop: "20px", width: "100%", justifyContent: "center" }
    }, "\u{1F9F9} Clear Lyrics Cache");
    clearCacheBtn.onclick = () => {
      if (onClearCache) {
        clearCacheBtn.classList.add("s-puff");
        setTimeout(() => clearCacheBtn.classList.remove("s-puff"), 600);
        onClearCache();
      }
    };
    syncSection.appendChild(clearCacheBtn);
    const syncSettingsControls = (explicitTarget) => {
      const s = state.getSettings();
      window.lyrify_settings = s;
      fontRange.value = String(s.fontPx);
      fontVal.textContent = String(s.fontPx);
      blurRange.value = String(s.blurPx);
      blurVal.textContent = String(s.blurPx);
      brightRange.value = String(Math.round(s.brightness * 100));
      brightVal.textContent = `${Math.round(s.brightness * 100)}%`;
      autoScrollCb.checked = s.autoScroll;
      showDebugCb.checked = s.showDebug;
      edgeFadeCb.checked = s.edgeFade;
      lineGapRange.value = String(s.lineGapPx);
      lineGapVal.textContent = `${s.lineGapPx}px`;
      maxWidthRange.value = String(s.maxWidthPx);
      maxWidthVal.textContent = `${s.maxWidthPx}px`;
      inactiveOpRange.value = String(s.inactiveOpacityPct);
      inactiveOpVal.textContent = `${s.inactiveOpacityPct}%`;
      vibrantCb.checked = s.vibrant;
      highlightActiveCb.checked = s.highlightActive;
      nicknameInput.value = s.nickname;
      if (manualSync) recordCb.checked = manualSync.isRecording();
      const target = explicitTarget || targetOverlay || document.getElementById("lyrify-overlay");
      if (target instanceof HTMLElement) {
        target.style.setProperty("--lyrify-line-font-size", `${s.fontPx}px`);
        target.style.setProperty("--lyrify-backdrop-blur", s.blurPx > 0 ? `blur(${s.blurPx}px)` : "none");
        target.style.setProperty("--lyrify-brightness", String(s.brightness));
        target.style.setProperty("--lyrify-lines-gap", `${s.lineGapPx}px`);
        target.style.setProperty("--lyrify-lines-max-width", `${s.maxWidthPx}px`);
        target.style.setProperty("--lyrify-line-dim-opacity", String(s.inactiveOpacityPct / 100));
        target.classList.toggle("s-vibrant-enabled", s.vibrant);
        target.classList.toggle("s-highlight-enabled", s.highlightActive);
        const scrollWrap = target.querySelector("#lyrify-scroll-wrap") || document.getElementById("lyrify-scroll-wrap");
        if (scrollWrap instanceof HTMLElement) scrollWrap.classList.toggle("s-fade-disabled", !s.edgeFade);
        const debugEl = target.querySelector("#lyrify-debug-info") || document.getElementById("lyrify-debug-info");
        if (debugEl instanceof HTMLElement) debugEl.style.display = s.showDebug ? "block" : "none";
      }
    };
    const persist = () => {
      state.saveSettings({
        fontPx: Number(fontRange.value),
        blurPx: Number(blurRange.value),
        brightness: Number(brightRange.value) / 100,
        autoScroll: autoScrollCb.checked,
        showDebug: showDebugCb.checked,
        edgeFade: edgeFadeCb.checked,
        lineGapPx: Number(lineGapRange.value),
        maxWidthPx: Number(maxWidthRange.value),
        inactiveOpacityPct: Number(inactiveOpRange.value),
        vibrant: vibrantCb.checked,
        highlightActive: highlightActiveCb.checked,
        nickname: nicknameInput.value.trim()
      });
      if (onLayoutChange) onLayoutChange(true);
      syncSettingsControls();
      if (onLayoutChange) setTimeout(() => onLayoutChange(false), 500);
    };
    [fontRange, blurRange, brightRange, lineGapRange, maxWidthRange, inactiveOpRange].forEach((input) => input.oninput = persist);
    [autoScrollCb, showDebugCb, edgeFadeCb, vibrantCb, highlightActiveCb].forEach((cb) => cb.onchange = persist);
    nicknameInput.oninput = persist;
    recordCb.onchange = () => {
      if (manualSync) {
        if (recordCb.checked) {
          manualSync.start();
          panel.classList.remove("s-open");
        } else {
          manualSync.stop();
        }
      }
    };
    closeBtn.onclick = () => panel.classList.remove("s-open");
    const addNav = (lab, targetId) => {
      const b = h("button", { className: "lyrify-settings-cat-btn" }, lab);
      b.onclick = () => {
        [generalSection, appearanceSection, syncSection].forEach((s) => s.style.display = s.id === targetId ? "" : "none");
        Array.from(nav.children).forEach((child) => child.classList.toggle("is-active", child === b));
      };
      nav.appendChild(b);
    };
    addNav("General", "lyrify-cat-general");
    addNav("Appearance", "lyrify-cat-appearance");
    addNav("Sync", "lyrify-cat-sync");
    if (nav.children[0]) nav.children[0].classList.add("is-active");
    [appearanceSection, syncSection].forEach((s) => s.style.display = "none");
    syncSettingsControls();
    return {
      element: panel,
      toggle: () => panel.classList.toggle("s-open"),
      syncSettings: syncSettingsControls
    };
  }

  // src/components/RecordHud.ts
  function createRecordHud(manual, onSubmit, onClose) {
    const hud = h("div", { id: "lyrify-record-hud" });
    const header = h("div", { id: "lyrify-record-hud-header" }, "Sync Mode");
    const closeBtn = h("button", { className: "lyrify-mini-header-btn", title: "Hide" }, [
      hSvg("svg", { viewBox: "0 0 24 24", fill: "none" }, [
        hSvg("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", fill: "none" })
      ])
    ]);
    header.appendChild(closeBtn);
    const trackNameEl = h("div", { id: "lyrify-record-hud-track" }, "Loading...");
    const statusEl = h("div", { id: "lyrify-record-hud-status" });
    const body = h("div", { id: "lyrify-record-hud-body" });
    const lineCurrent = h("div", { id: "lyrify-record-hud-line" }, "...");
    const actions = h("div", { id: "lyrify-record-hud-actions" });
    const undoBtn = h("button", { className: "lyrify-btn", style: { padding: "4px 10px" }, title: "Undo (Backspace)" }, "Undo");
    const submitBtn = h("button", { className: "lyrify-btn", style: { padding: "4px 10px", fontWeight: "700", borderColor: "var(--lyrify-accent-strong)" }, title: "Submit for review" }, "Submit");
    const counter = h("div", { id: "lyrify-record-hud-counter" }, "0 / 0");
    actions.appendChild(undoBtn);
    actions.appendChild(submitBtn);
    actions.appendChild(counter);
    const hint = h("div", { id: "lyrify-record-hud-hint" }, "Enter/Space to capture");
    const toast = h("div", { id: "lyrify-record-hud-toast" }, "Saved");
    const list = h("div", { id: "lyrify-record-hud-list" });
    body.appendChild(lineCurrent);
    body.appendChild(actions);
    body.appendChild(hint);
    body.appendChild(toast);
    body.appendChild(list);
    hud.appendChild(header);
    hud.appendChild(trackNameEl);
    hud.appendChild(statusEl);
    hud.appendChild(body);
    let dragging = false;
    let startX = 0, startY = 0, originLeft = 0, originTop = 0;
    header.onpointerdown = (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = hud.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      const onMove = (me) => {
        if (!dragging) return;
        hud.style.left = `${originLeft + (me.clientX - startX)}px`;
        hud.style.top = `${originTop + (me.clientY - startY)}px`;
        hud.style.bottom = "auto";
      };
      const onUp = () => {
        dragging = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
    closeBtn.onclick = () => {
      hud.classList.remove("s-open");
      manual.stop();
      if (onClose) onClose();
    };
    undoBtn.onclick = () => {
      if (manual.isLocked()) return;
      manual.undo();
      updateView();
    };
    const showToast = (msg) => {
      toast.textContent = msg;
      toast.classList.add("s-show");
      setTimeout(() => toast.classList.remove("s-show"), 1500);
    };
    submitBtn.onclick = async () => {
      if (manual.isLocked()) return;
      if (onSubmit) {
        await onSubmit();
        showToast("Submitted!");
      } else {
        const btn = document.getElementById("lyrify-submit");
        if (btn) {
          btn.click();
          showToast("Submitted!");
        }
      }
    };
    const updateView = () => {
      const lyrics = state.getLyrics();
      const curIdx = manual.getCurrentIndex();
      const cur = lyrics.lines[curIdx];
      lineCurrent.textContent = cur ? cur.text : "All lines recorded";
      const total = lyrics.lines.length;
      const syncedCount = lyrics.lines.filter((l) => l.startTime !== null).length;
      counter.textContent = `${syncedCount} / ${total}`;
      list.innerHTML = "";
      lyrics.lines.filter((l) => l.startTime !== null).slice(-3).reverse().forEach((l) => {
        const item = h("div", {
          className: "lyrify-record-hud-item",
          onclick: () => window.Spicetify.Player.seek(l.startTime)
        });
        item.appendChild(h("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pointerEvents: "none" } }, l.text));
        item.appendChild(h("div", { className: "lyrify-record-hud-item-time", style: { pointerEvents: "none" } }, formatMs(l.startTime)));
        list.appendChild(item);
      });
    };
    return {
      element: hud,
      toggle: () => hud.classList.toggle("s-open"),
      update: () => updateView(),
      updateTrack: (info, synced) => {
        trackNameEl.textContent = info;
        manual.setLocked(synced);
        [undoBtn, submitBtn].forEach((b) => b.disabled = synced);
        if (synced) {
          statusEl.textContent = "\u2713 Verified";
          statusEl.style.color = "#1db954";
        } else {
          statusEl.textContent = "\u26A0 Unsynchronized";
          statusEl.style.color = "#ea580c";
        }
        updateView();
      },
      showRecord: () => {
        hud.classList.add("s-open");
        updateView();
        showToast("Recording Started");
      }
    };
  }

  // src/components/Overlay.ts
  var SVG_PREV = `<svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L3.483 1.141a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
  var SVG_NEXT = `<svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l8.517-5.709a.7.7 0 0 1 1.083.593v12.532a.7.7 0 0 1-1.083.593L4 9.15V14.3a.7.7 0 0 1-.7.7H1.6a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7H3.3z"/></svg>`;
  var SVG_PLAY = `<svg viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894a.7.7 0 0 1-1.05-.607V1.713z"/></svg>`;
  var SVG_PAUSE = `<svg viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
  function createOverlay(options) {
    const overlay = h("div", { id: "lyrify-overlay", style: { display: "none" } });
    const card = h("div", { id: "lyrify-card" });
    const loadingBar = h("div", { id: "lyrify-loading-bar" });
    const loadingBarInner = h("div", { id: "lyrify-loading-bar-inner" });
    loadingBar.appendChild(loadingBarInner);
    const header = h("div", { id: "lyrify-header" });
    const headerTitleEl = h("div", { id: "lyrify-title" });
    const reqSyncBtn = h("button", { className: "lyrify-req-sync-btn" }, "Request Sync");
    const headerRight = h("div", { id: "lyrify-header-right" });
    const splitViewBtn = h("button", { id: "lyrify-splitview-toggle", title: "Immersive Split-screen" }, "\u26F6");
    const miniBtn = h("button", { id: "lyrify-mini-toggle" }, "Mini");
    const settingsBtn = h("button", { id: "lyrify-settings-toggle", title: "Display settings" }, "\u2699");
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
      options.onSubmit(lyrics.trackKey, lyrics.lines, "");
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
    const leftPanel = h("div", { id: "lyrify-left-panel" });
    const coverWrap = h("div", { id: "lyrify-fs-cover-wrap" });
    const coverArt = h("img", { id: "lyrify-fs-cover", src: "" });
    const coverOverlay = h("div", { id: "lyrify-fs-cover-overlay" });
    const trackTitle = h("div", { id: "lyrify-fs-title" }, "-");
    const trackArtist = h("div", { id: "lyrify-fs-artist" }, "-");
    const seekSection = h("div", { id: "lyrify-fs-seek" });
    const seekCurrent = h("div", { className: "lyrify-fs-time" }, "0:00");
    const seekRange = h("input", { type: "range", min: "0", max: "1000", step: "1", value: "0" });
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
    btnPrev.onclick = () => {
      window.Spicetify.Player.back();
      isAutoFollowEnabled = true;
    };
    btnPlay.onclick = () => {
      window.Spicetify.Player.togglePlay();
    };
    btnNext.onclick = () => {
      window.Spicetify.Player.next();
      isAutoFollowEnabled = true;
    };
    let isSeekDragging = false;
    seekRange.onpointerdown = () => {
      isSeekDragging = true;
    };
    seekRange.onpointerup = () => {
      isSeekDragging = false;
    };
    seekRange.oninput = () => {
      const dur = window.Spicetify.Player.getDuration();
      const val = Number(seekRange.value);
      seekCurrent.textContent = formatMs(Math.floor(val / 1e3 * dur));
      seekRange.style.setProperty("--progress", `${val / 10}%`);
    };
    seekRange.onchange = () => {
      const dur = window.Spicetify.Player.getDuration();
      const val = Number(seekRange.value);
      window.Spicetify.Player.seek(Math.floor(val / 1e3 * dur));
    };
    const rightWrap = h("div", { className: "lyrify-right-wrap" });
    rightWrap.appendChild(loadingBar);
    rightWrap.appendChild(header);
    rightWrap.appendChild(settingsPanel.element);
    rightWrap.appendChild(body);
    card.appendChild(leftPanel);
    card.appendChild(rightWrap);
    const exitFsBtn = h("div", { className: "lyrify-fs-exit-btn", title: "Exit Full Screen" });
    exitFsBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M16 10l-4 4-4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    overlay.appendChild(vibrantBg);
    overlay.appendChild(exitFsBtn);
    overlay.appendChild(card);
    overlay.appendChild(recordHud.element);
    let currentDebugText = "";
    const applyAccentColor = async (imageUrl) => {
      var _a2;
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
      let c1 = rgbToHsl(r, g, b);
      let c2 = [(c1[0] + 40) % 360, Math.min(100, c1[1] + 10), Math.max(10, c1[2] - 5)];
      let c3 = [(c1[0] - 35 + 360) % 360, c1[1], Math.min(90, c1[2] + 10)];
      let c4 = [(c1[0] + 120) % 360, Math.max(0, c1[1] - 20), c1[2]];
      if (palette && palette.length >= 4) {
        c1 = rgbToHsl(palette[0].r, palette[0].g, palette[0].b);
        c2 = rgbToHsl(palette[1].r, palette[1].g, palette[1].b);
        c3 = rgbToHsl(palette[2].r, palette[2].g, palette[2].b);
        c4 = rgbToHsl(palette[3].r, palette[3].g, palette[3].b);
        [c1, c2, c3, c4].forEach((c) => {
          c[1] = Math.min(100, c[1] + 20);
          c[2] = Math.min(85, Math.max(35, c[2] + 10));
        });
      }
      overlay.style.setProperty("--lyrify-color-1", `hsl(${c1[0]}, ${c1[1]}%, ${c1[2]}%)`);
      overlay.style.setProperty("--lyrify-color-2", `hsl(${c2[0]}, ${c2[1]}%, ${c2[2]}%)`);
      overlay.style.setProperty("--lyrify-color-3", `hsl(${c3[0]}, ${c3[1]}%, ${c3[2]}%)`);
      overlay.style.setProperty("--lyrify-color-4", `hsl(${c4[0]}, ${c4[1]}%, ${c4[2]}%)`);
      const isVibrant = (_a2 = window.lyrify_settings) == null ? void 0 : _a2.vibrant;
      if (isVibrant) {
        overlay.style.setProperty("--lyrify-fade-edge", `rgba(18, 18, 18, 0.5)`);
      } else {
        overlay.style.setProperty("--lyrify-fade-edge", `rgba(${cr},${cg},${cb},0.96)`);
      }
    };
    function rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h2 = 0, s, l = (max + min) / 2;
      if (max === min) {
        h2 = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h2 = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h2 = (b - r) / d + 2;
            break;
          case b:
            h2 = (r - g) / d + 4;
            break;
        }
        h2 /= 6;
      }
      return [Math.round(h2 * 360), Math.round(s * 100), Math.round(l * 100)];
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
      const activeNode = linesEl.children[activeIdx];
      if (activeNode) {
        const rect = activeNode.getBoundingClientRect();
        const viewRect = scrollInner.getBoundingClientRect();
        const isVisible = rect.top >= viewRect.top - 10 && rect.bottom <= viewRect.bottom + 10;
        jumpNowBtn.style.display = isVisible ? "none" : "block";
      } else {
        jumpNowBtn.style.display = "none";
      }
    };
    const disableFollow = () => {
      if (isAutoFollowEnabled) {
        isAutoFollowEnabled = false;
        updateJumpBtnVisibility();
      }
    };
    scrollInner.addEventListener("wheel", disableFollow, { passive: true });
    scrollInner.addEventListener("touchstart", disableFollow, { passive: true });
    scrollInner.onscroll = debounceByAnimationFrame(() => {
      updateJumpBtnVisibility();
      const st = scrollInner.scrollTop;
      const sh = scrollInner.scrollHeight;
      const ch = scrollInner.clientHeight;
      scrollInner.classList.toggle("s-no-mask-top", st <= 30);
      scrollInner.classList.toggle("s-no-mask-bottom", st + ch >= sh - 30);
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
    let mouseTimer = null;
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
    let lastPlayState = null;
    const syncLoop = () => {
      var _a2, _b, _c, _d;
      if (isSplitView) {
        const spc = window.Spicetify.Player;
        const progressMs = spc.getProgress();
        const durationMs = spc.getDuration();
        const isPlaying = spc.isPlaying();
        const trackInfo = ((_b = (_a2 = spc.data) == null ? void 0 : _a2.track) == null ? void 0 : _b.metadata) || {};
        const itemInfo = ((_c = spc.data) == null ? void 0 : _c.item) || {};
        if (lastPlayState !== isPlaying) {
          btnPlay.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
          lastPlayState = isPlaying;
        }
        if (!isSeekDragging) {
          const curStr = formatMs(progressMs);
          const totStr = formatMs(durationMs);
          if (seekCurrent.textContent !== curStr) seekCurrent.textContent = curStr;
          if (seekTotal.textContent !== totStr) seekTotal.textContent = totStr;
          const rawVal = durationMs > 0 ? progressMs / durationMs * 1e3 : 0;
          const valStr = String(rawVal);
          if (seekRange.value !== valStr) seekRange.value = valStr;
          seekRange.style.setProperty("--progress", `${rawVal / 10}%`);
        }
        const fallbackArtist = safeText((_d = itemInfo == null ? void 0 : itemInfo.artists) == null ? void 0 : _d.map((a) => safeText(a == null ? void 0 : a.name)).join(", "));
        const newTitle = trackInfo.title || (itemInfo == null ? void 0 : itemInfo.name) || "-";
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
        setTimeout(() => {
          ignoreProgrammaticScroll = false;
        }, 1e3);
        jumpNowBtn.style.display = "none";
      }
    };
    return {
      element: overlay,
      resetSplitView: () => {
        isSplitView = false;
        overlay.classList.remove("s-split-view");
      },
      setHeader: (text) => {
        headerTitleEl.textContent = text;
      },
      setMeta: (text) => {
        meta.textContent = text;
      },
      setDebug: (text) => {
        currentDebugText = text;
        debugInfo.textContent = text;
      },
      setLoading: (loading) => {
        loadingBar.classList.toggle("s-active", loading);
      },
      updateRecordHudTrack: (info, synced) => recordHud.updateTrack(info, synced),
      refreshRecordHud: () => recordHud.update(),
      showRecordHud: () => recordHud.showRecord(),
      showClearWave: () => {
        clearWave.classList.remove("s-animate");
        void clearWave.offsetWidth;
        clearWave.classList.add("s-animate");
      },
      applyAccentColor,
      resetFollow: () => {
        isAutoFollowEnabled = true;
        lastLyricsKey = "";
        scrollInner.scrollTop = 0;
      },
      setIgnoreScroll: (ignore) => {
        ignoreProgrammaticScroll = ignore;
      },
      render: (miniOpen2) => {
        isMiniOpen = miniOpen2;
        const settings = window.lyrify_settings || {};
        debugInfo.style.display = settings.showDebug ? "block" : "none";
        if (isMiniOpen) {
          linesEl.innerHTML = "";
          const msg = h("div", { style: { textAlign: "center", padding: "40px 20px", opacity: "0.6", fontSize: "16px" } }, "\u0422\u0435\u043A\u0441\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0432 \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u043E\u043C \u043E\u043A\u043D\u0435.");
          linesEl.appendChild(msg);
          jumpNowBtn.style.display = "none";
          lastLyricsKey = "mini";
          return;
        }
        const lyrics = state.getLyrics();
        const activeIdx = state.getActiveIndex();
        const recordIdx = options.manual.isRecording() ? options.manual.getCurrentIndex() : null;
        const lyricsKey = `${lyrics.trackKey}-${lyrics.lines.length}`;
        if (lyrics.lines.length > 0) {
          loadingBar.classList.remove("s-active");
        }
        if (lyrics.authorNickname) {
          meta.textContent = `\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043E: @${lyrics.authorNickname}`;
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
                isAutoFollowEnabled = true;
                ignoreProgrammaticScroll = true;
                div.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                  ignoreProgrammaticScroll = false;
                }, 1e3);
                if (l.startTime !== null) window.Spicetify.Player.seek(l.startTime);
              }
            }, l.text);
            linesEl.appendChild(div);
          });
          lastLyricsKey = lyricsKey;
          scrollInner.scrollTop = 0;
        }
        const shouldShowReq = !isMiniOpen && !lyrics.isNotFound && !lyrics.synced && lyrics.lines.length > 0 && lyrics.trackKey && lyrics.trackKey !== "none";
        if (shouldShowReq) {
          reqSyncBtn.classList.add("s-visible");
          reqSyncBtn.onclick = () => {
            var _a2, _b, _c, _d, _e, _f, _g;
            if (reqSyncBtn.classList.contains("s-success")) return;
            reqSyncBtn.classList.add("s-success");
            reqSyncBtn.textContent = "\u2713 Requested";
            const spc = window.Spicetify.Player;
            const tInfo = ((_b = (_a2 = spc.data) == null ? void 0 : _a2.track) == null ? void 0 : _b.metadata) || {};
            const fallbackArtist = (_e = (_d = (_c = spc.data) == null ? void 0 : _c.item) == null ? void 0 : _d.artists) == null ? void 0 : _e.map((a) => a.name).join(", ");
            const artist = tInfo.artist_name || fallbackArtist || "Unknown Artist";
            const title = tInfo.title || ((_g = (_f = spc.data) == null ? void 0 : _f.item) == null ? void 0 : _g.name) || "Unknown Track";
            fetch("https://lyrify-api.aquashield.lol/request-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ trackKey: lyrics.trackKey, artist, title })
            }).catch(() => {
            });
            setTimeout(() => {
              reqSyncBtn.classList.add("s-fade-out");
              setTimeout(() => {
                reqSyncBtn.classList.remove("s-visible", "s-success", "s-fade-out");
                reqSyncBtn.textContent = "Request Sync";
              }, 400);
            }, 2e3);
          };
        } else {
          reqSyncBtn.classList.remove("s-visible", "s-success", "s-fade-out");
          reqSyncBtn.textContent = "Request Sync";
        }
        Array.from(linesEl.children).forEach((el, i) => {
          el.classList.toggle("s-active", i === activeIdx);
          el.classList.toggle("s-record", i === recordIdx);
        });
        updateJumpBtnVisibility();
        if (settings.autoScroll && isAutoFollowEnabled && activeIdx !== -1) {
          const activeNode = linesEl.children[activeIdx];
          if (activeNode && !options.manual.isRecording()) {
            const rect = activeNode.getBoundingClientRect();
            const viewRect = scrollInner.getBoundingClientRect();
            const viewCenter = viewRect.top + viewRect.height / 2;
            const nodeCenter = rect.top + rect.height / 2;
            const isFarFromCenter = Math.abs(nodeCenter - viewCenter) > 50;
            if (isFarFromCenter) {
              ignoreProgrammaticScroll = true;
              activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => {
                ignoreProgrammaticScroll = false;
              }, 1e3);
            }
          }
        }
      }
    };
  }
  function safeText(s) {
    return typeof s === "string" ? s.trim() : "";
  }

  // src/components/MiniPlayer.ts
  var SVG_PREV2 = `<svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L3.483 1.141a.7.7 0 0 0-1.083.593v12.532a.7.7 0 0 0 1.083.593L12 9.15V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/></svg>`;
  var SVG_NEXT2 = `<svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l8.517-5.709a.7.7 0 0 1 1.083.593v12.532a.7.7 0 0 1-1.083.593L4 9.15V14.3a.7.7 0 0 1-.7.7H1.6a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7H3.3z"/></svg>`;
  var SVG_PLAY2 = `<svg viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894a.7.7 0 0 1-1.05-.607V1.713z"/></svg>`;
  var SVG_PAUSE2 = `<svg viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
  var SVG_CLOSE = `<svg viewBox="0 0 16 16"><path d="M14.354 1.646a.5.5 0 0 0-.708 0L8 7.293 2.354 1.646a.5.5 0 0 0-.708.708L7.293 8l-5.647 5.646a.5.5 0 0 0 .708.708L8 8.707l5.646 5.647a.5.5 0 0 0 .708-.708L8.707 8l5.647-5.646a.5.5 0 0 0 0-.708z"/></svg>`;
  function createMiniPlayer(options = {}) {
    const mini = h("div", { id: "lyrify-mini" });
    const header = h("div", { id: "lyrify-mini-header" });
    const title = h("span", {}, "Mini Player");
    const closeBtn = h("button", { id: "lyrify-mini-close", className: "lyrify-mini-header-btn", title: "Close" });
    closeBtn.innerHTML = SVG_CLOSE;
    closeBtn.onclick = (e) => {
      var _a2;
      e.stopPropagation();
      (_a2 = options.onClose) == null ? void 0 : _a2.call(options);
    };
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = h("div", { id: "lyrify-mini-body" });
    const info = h("div", { className: "lyrify-mini-info" }, "-");
    const scroll = h("div", { id: "lyrify-mini-scroll" });
    const seek = h("div", { id: "lyrify-mini-seek" });
    const actions = h("div", { id: "lyrify-mini-actions" });
    const miniSeekCurrent = h("div", { className: "lyrify-mini-time" }, "0:00");
    const miniSeekRange = h("input", { type: "range", min: "0", max: "1000", step: "1", value: "0" });
    const miniSeekTotal = h("div", { className: "lyrify-mini-time" }, "0:00");
    seek.appendChild(miniSeekCurrent);
    seek.appendChild(miniSeekRange);
    seek.appendChild(miniSeekTotal);
    const miniPrev = h("button", { className: "lyrify-mini-icon-btn", title: "Previous" });
    const miniPlay = h("button", { className: "lyrify-mini-icon-btn s-play", title: "Play / Pause" });
    const miniNext = h("button", { className: "lyrify-mini-icon-btn", title: "Next" });
    miniPrev.innerHTML = SVG_PREV2;
    miniPlay.innerHTML = SVG_PLAY2;
    miniNext.innerHTML = SVG_NEXT2;
    actions.appendChild(miniPrev);
    actions.appendChild(miniPlay);
    actions.appendChild(miniNext);
    let isAutoFollowEnabled = true;
    let ignoreProgrammaticScroll = false;
    const jumpNowBtn = h("button", { id: "lyrify-mini-jump" }, "Go to current line");
    jumpNowBtn.onclick = () => {
      isAutoFollowEnabled = true;
      const active = scroll.querySelector(".s-active");
      if (active) {
        ignoreProgrammaticScroll = true;
        active.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          ignoreProgrammaticScroll = false;
        }, 1e3);
      }
      jumpNowBtn.style.display = "none";
    };
    const bodyWrap = h("div", { style: { position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } });
    bodyWrap.appendChild(scroll);
    bodyWrap.appendChild(jumpNowBtn);
    body.appendChild(info);
    body.appendChild(bodyWrap);
    body.appendChild(seek);
    body.appendChild(actions);
    mini.appendChild(header);
    mini.appendChild(body);
    scroll.onscroll = debounceByAnimationFrame(() => {
      if (!ignoreProgrammaticScroll) {
        if (isAutoFollowEnabled) {
          isAutoFollowEnabled = false;
        }
      }
      const activeIdx = state.getActiveIndex();
      const activeNode = scroll.children[activeIdx];
      if (activeNode) {
        const rect = activeNode.getBoundingClientRect();
        const viewRect = scroll.getBoundingClientRect();
        const isVisible = rect.top >= viewRect.top - 10 && rect.bottom <= viewRect.bottom + 10;
        jumpNowBtn.style.display = isVisible || isAutoFollowEnabled ? "none" : "block";
      } else {
        jumpNowBtn.style.display = "none";
      }
    });
    let dragging = false;
    let startX = 0, startY = 0, originLeft = 0, originTop = 0;
    header.onpointerdown = (e) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = mini.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      const onMove = (me) => {
        if (!dragging) return;
        mini.style.left = `${originLeft + (me.clientX - startX)}px`;
        mini.style.top = `${originTop + (me.clientY - startY)}px`;
        mini.style.right = "auto";
        mini.style.bottom = "auto";
      };
      const onUp = () => {
        dragging = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
    miniPrev.onclick = () => {
      window.Spicetify.Player.back();
      isAutoFollowEnabled = true;
      setTimeout(() => renderFunc(), 100);
    };
    miniPlay.onclick = () => {
      window.Spicetify.Player.togglePlay();
      setTimeout(() => renderFunc(), 100);
    };
    miniNext.onclick = () => {
      window.Spicetify.Player.next();
      isAutoFollowEnabled = true;
      setTimeout(() => renderFunc(), 100);
    };
    miniSeekRange.oninput = () => {
      const dur = window.Spicetify.Player.getDuration();
      const val = Number(miniSeekRange.value);
      miniSeekCurrent.textContent = formatMs(Math.floor(val / 1e3 * dur));
    };
    miniSeekRange.onchange = () => {
      const dur = window.Spicetify.Player.getDuration();
      const val = Number(miniSeekRange.value);
      window.Spicetify.Player.seek(Math.floor(val / 1e3 * dur));
    };
    let lastTrackKey = null;
    let lastActiveIdx = -1;
    const renderFunc = () => {
      var _a2, _b;
      const lyrics = state.getLyrics();
      const activeIdx = state.getActiveIndex();
      const progressMs = window.Spicetify.Player.getProgress();
      const durationMs = window.Spicetify.Player.getDuration();
      const isPlaying = window.Spicetify.Player.isPlaying();
      const trackInfo = ((_b = (_a2 = window.Spicetify.Player.data) == null ? void 0 : _a2.track) == null ? void 0 : _b.metadata) || {};
      info.textContent = trackInfo.artist_name ? `${trackInfo.artist_name} \u2014 ${trackInfo.title}` : "-";
      miniSeekCurrent.textContent = formatMs(progressMs);
      miniSeekTotal.textContent = formatMs(durationMs);
      miniSeekRange.value = String(durationMs > 0 ? progressMs / durationMs * 1e3 : 0);
      miniPlay.innerHTML = isPlaying ? SVG_PAUSE2 : SVG_PLAY2;
      const needsRebuild = lyrics.trackKey !== lastTrackKey || lyrics.lines.length > 0 && scroll.children.length === 0;
      if (needsRebuild && lyrics.lines.length > 0) {
        scroll.innerHTML = "";
        lyrics.lines.forEach((l, i) => {
          if (!l.text) return;
          const div = h("div", {
            className: "lyrify-mini-line",
            onclick: () => {
              isAutoFollowEnabled = true;
              if (l.startTime !== null) window.Spicetify.Player.seek(l.startTime);
            }
          }, l.text);
          scroll.appendChild(div);
        });
        lastTrackKey = lyrics.trackKey;
        lastActiveIdx = -1;
        isAutoFollowEnabled = true;
      }
      if (activeIdx !== lastActiveIdx || needsRebuild) {
        Array.from(scroll.children).forEach((el, i) => {
          el.classList.toggle("s-active", i === activeIdx);
          el.classList.toggle("s-prev", i === activeIdx - 1);
          el.classList.toggle("s-next", i === activeIdx + 1);
        });
        lastActiveIdx = activeIdx;
      }
      if (isAutoFollowEnabled && activeIdx !== -1) {
        const activeNode = scroll.children[activeIdx];
        if (activeNode) {
          const rect = activeNode.getBoundingClientRect();
          const viewRect = scroll.getBoundingClientRect();
          const viewCenter = viewRect.top + viewRect.height / 2;
          const nodeCenter = rect.top + rect.height / 2;
          const isFarFromCenter = Math.abs(nodeCenter - viewCenter) > 25;
          if (isFarFromCenter || needsRebuild) {
            ignoreProgrammaticScroll = true;
            activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
              ignoreProgrammaticScroll = false;
            }, 600);
          }
        }
      }
    };
    return {
      element: mini,
      toggle: () => mini.classList.toggle("s-open"),
      render: renderFunc
    };
  }

  // src/playerObserver.ts
  function createPlayerObserver(onTrackChange) {
    const w = window;
    const getTrackInfo = () => {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S;
      const ps = (_b = (_a2 = w.Spicetify) == null ? void 0 : _a2.Player) == null ? void 0 : _b.data;
      const queue = (_g = (_c = w.Spicetify) == null ? void 0 : _c.Queue) != null ? _g : (_f = (_e = (_d = w.Spicetify) == null ? void 0 : _d.Platform) == null ? void 0 : _e.PlayerAPI) == null ? void 0 : _f._queue;
      const queueTrack = (_k = (_i = queue == null ? void 0 : queue.item) != null ? _i : (_h = queue == null ? void 0 : queue.queued) == null ? void 0 : _h[0]) != null ? _k : (_j = queue == null ? void 0 : queue.nextTracks) == null ? void 0 : _j[0];
      const mdCandidates = [
        (_l = ps == null ? void 0 : ps.track) == null ? void 0 : _l.metadata,
        ps == null ? void 0 : ps.context_metadata,
        ps == null ? void 0 : ps.page_metadata,
        ps == null ? void 0 : ps.track,
        ps == null ? void 0 : ps.item,
        (_m = ps == null ? void 0 : ps.item) == null ? void 0 : _m.metadata,
        (_n = ps == null ? void 0 : ps.item) == null ? void 0 : _n.album,
        (_p = (_o = ps == null ? void 0 : ps.item) == null ? void 0 : _o.artists) == null ? void 0 : _p[0],
        (_q = ps == null ? void 0 : ps.item) == null ? void 0 : _q.artist,
        queueTrack,
        queueTrack == null ? void 0 : queueTrack.metadata,
        (_r = ps == null ? void 0 : ps.context_metadata) == null ? void 0 : _r.metadata,
        (_s = ps == null ? void 0 : ps.page_metadata) == null ? void 0 : _s.metadata
      ];
      const safeText2 = (s) => typeof s === "string" ? s.trim() : "";
      const firstNonEmptyString = (objects, keys) => {
        for (const obj of objects) {
          if (!obj || typeof obj !== "object") continue;
          for (const k of keys) {
            const v = obj[k];
            const t = safeText2(v);
            if (t) return t;
          }
        }
        return "";
      };
      const artistFromArray = safeText2((_u = (_t = ps == null ? void 0 : ps.item) == null ? void 0 : _t.artists) == null ? void 0 : _u.map((a) => safeText2(a == null ? void 0 : a.name)).filter(Boolean).join(", ")) || safeText2((_v = queueTrack == null ? void 0 : queueTrack.artists) == null ? void 0 : _v.map((a) => safeText2(a == null ? void 0 : a.name)).filter(Boolean).join(", "));
      const artist = artistFromArray || firstNonEmptyString(mdCandidates, ["artist_name", "album_artist_name", "artist", "artistName", "name"]);
      const title = firstNonEmptyString(mdCandidates, ["title", "name", "track_name", "trackName"]);
      const durationMsCandidates = [
        ps == null ? void 0 : ps.duration,
        (_w = ps == null ? void 0 : ps.item) == null ? void 0 : _w.duration,
        (_x = ps == null ? void 0 : ps.item) == null ? void 0 : _x.duration_ms,
        queueTrack == null ? void 0 : queueTrack.duration,
        (_y = ps == null ? void 0 : ps.context_metadata) == null ? void 0 : _y.duration,
        (_z = ps == null ? void 0 : ps.page_metadata) == null ? void 0 : _z.duration,
        (_B = (_A = ps == null ? void 0 : ps.track) == null ? void 0 : _A.metadata) == null ? void 0 : _B.duration
      ];
      const durationMsRaw = durationMsCandidates.find((v) => v !== void 0 && v !== null);
      const durationMs = typeof durationMsRaw === "number" ? durationMsRaw : typeof durationMsRaw === "string" ? Number(durationMsRaw) : Number(durationMsRaw != null ? durationMsRaw : NaN);
      const durationSeconds = Number.isFinite(durationMs) && durationMs > 0 ? durationMs / 1e3 : void 0;
      const imageCandidates = [
        (_F = (_E = (_D = (_C = ps == null ? void 0 : ps.item) == null ? void 0 : _C.album) == null ? void 0 : _D.images) == null ? void 0 : _E[0]) == null ? void 0 : _F.url,
        (_I = (_H = (_G = ps == null ? void 0 : ps.item) == null ? void 0 : _G.images) == null ? void 0 : _H[0]) == null ? void 0 : _I.url,
        (_K = (_J = ps == null ? void 0 : ps.track) == null ? void 0 : _J.metadata) == null ? void 0 : _K.image_xlarge_url,
        (_M = (_L = ps == null ? void 0 : ps.track) == null ? void 0 : _L.metadata) == null ? void 0 : _M.image_large_url,
        (_O = (_N = ps == null ? void 0 : ps.track) == null ? void 0 : _N.metadata) == null ? void 0 : _O.image_url,
        (_P = ps == null ? void 0 : ps.page_metadata) == null ? void 0 : _P.image_xlarge_url,
        (_Q = ps == null ? void 0 : ps.page_metadata) == null ? void 0 : _Q.image_large_url,
        (_R = ps == null ? void 0 : ps.page_metadata) == null ? void 0 : _R.image_url
      ];
      const rawImage = imageCandidates.find((v) => typeof v === "string" && v.length > 0);
      const imageUrl = (() => {
        if (!rawImage) return void 0;
        if (rawImage.startsWith("spotify:image:")) {
          const id = rawImage.split(":")[2];
          if (id) return `https://i.scdn.co/image/${id}`;
        }
        if (rawImage.startsWith("https://") || rawImage.startsWith("http://")) return rawImage;
        return void 0;
      })();
      const uri = firstNonEmptyString(mdCandidates, ["uri", "track_uri"]);
      return {
        artist,
        title,
        uri: uri || ((_S = ps == null ? void 0 : ps.item) == null ? void 0 : _S.uri),
        durationSeconds,
        durationMs: Number.isFinite(durationMs) ? durationMs : void 0,
        imageUrl
      };
    };
    const isAdPlaying = () => {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      try {
        const ps = (_b = (_a2 = w.Spicetify) == null ? void 0 : _a2.Player) == null ? void 0 : _b.data;
        const md = (_g = (_f = (_e = (_c = ps == null ? void 0 : ps.track) == null ? void 0 : _c.metadata) != null ? _e : (_d = ps == null ? void 0 : ps.item) == null ? void 0 : _d.metadata) != null ? _f : ps == null ? void 0 : ps.item) != null ? _g : {};
        const uri = String((_j = (_i = md == null ? void 0 : md.uri) != null ? _i : (_h = ps == null ? void 0 : ps.item) == null ? void 0 : _h.uri) != null ? _j : "").toLowerCase();
        const type = String((_n = (_m = (_k = md == null ? void 0 : md.media_type) != null ? _k : md == null ? void 0 : md.type) != null ? _m : (_l = ps == null ? void 0 : ps.item) == null ? void 0 : _l.type) != null ? _n : "").toLowerCase();
        const explicitFlags = [
          (_o = ps == null ? void 0 : ps.item) == null ? void 0 : _o.is_ad,
          (_p = ps == null ? void 0 : ps.item) == null ? void 0 : _p.isAdvertisement,
          ps == null ? void 0 : ps.is_ad,
          md == null ? void 0 : md.is_ad,
          md == null ? void 0 : md.isAdvertisement
        ];
        if (explicitFlags.some(Boolean)) return true;
        if (uri.includes("spotify:ad:") || uri.includes("spotify:advertisement:")) return true;
        if (type === "ad" || type === "advertisement") return true;
      } catch (e) {
      }
      return false;
    };
    const listener = (event) => {
      var _a2, _b;
      onTrackChange((_b = (_a2 = event == null ? void 0 : event.data) == null ? void 0 : _a2.track) == null ? void 0 : _b.uri);
    };
    w.Spicetify.Player.addEventListener("songchange", listener);
    return {
      getTrackInfo,
      isAdPlaying,
      destroy: () => {
        w.Spicetify.Player.removeEventListener("songchange", listener);
      }
    };
  }

  // src/syncModel.ts
  function toTrackKey(artist, title, durationSeconds) {
    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    const base = `${clean(artist)}-${clean(title)}`;
    if (durationSeconds) {
      return `${base}-${Math.round(durationSeconds)}`;
    }
    return base;
  }
  function findCurrentLineIndex(lines, progressMs) {
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      const st = lines[i].startTime;
      if (st !== null && st <= progressMs) {
        idx = i;
      }
    }
    return idx;
  }
  function parseSyncedLyricsLrc(lrc) {
    const result = [];
    const lines = lrc.split("\n");
    const timeRegex = /\[(\d+):(\d+\.?\d*)\]/g;
    for (const line of lines) {
      const times = [];
      let match;
      while ((match = timeRegex.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseFloat(match[2]);
        times.push(Math.round((min * 60 + sec) * 1e3));
      }
      const text = line.replace(timeRegex, "").trim();
      if (!text && times.length === 0) continue;
      for (const t of times) {
        result.push({ text, startTime: t });
      }
    }
    return result.sort((a, b) => {
      var _a2, _b;
      return ((_a2 = a.startTime) != null ? _a2 : 0) - ((_b = b.startTime) != null ? _b : 0);
    });
  }
  function parseUnsyncedLyricsPlain(plain) {
    return plain.split("\n").map((l) => l.trim()).filter(Boolean).map((text) => ({ text, startTime: null }));
  }

  // src/lrclibClient.ts
  var LRCLIB_GET_URL = "https://lrclib.net/api/get";
  var LYRICS_OVH_URL = "https://api.lyrics.ovh/v1";
  var LYRICA_DEFAULT_URL = "https://test-0k.onrender.com";
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))
    ]);
  }
  async function fetchPlainLyricsFallback(artist, title, signal) {
    const url = `${LYRICS_OVH_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    try {
      const res = await withTimeout(fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal }), 3e3);
      if (!res.ok) return "";
      const json = await res.json();
      return typeof (json == null ? void 0 : json.lyrics) === "string" ? json.lyrics.trim() : "";
    } catch (e) {
      return "";
    }
  }
  function getLyricaBaseUrl() {
    var _a2;
    try {
      const fromLs = (_a2 = localStorage.getItem("lyrify_lyrica_url")) == null ? void 0 : _a2.trim();
      if (fromLs) return fromLs.replace(/\/+$/, "");
    } catch (e) {
    }
    return LYRICA_DEFAULT_URL;
  }
  async function fetchFromLyrica(artist, title, signal) {
    var _a2, _b, _c, _d, _e;
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
    const json = await res.json();
    const syncedCandidates = [
      json == null ? void 0 : json.syncedLyrics,
      json == null ? void 0 : json.synced_lyrics,
      json == null ? void 0 : json.lrc,
      json == null ? void 0 : json.timestamps_lrc,
      (_a2 = json == null ? void 0 : json.data) == null ? void 0 : _a2.syncedLyrics,
      (_b = json == null ? void 0 : json.data) == null ? void 0 : _b.synced_lyrics,
      (_c = json == null ? void 0 : json.data) == null ? void 0 : _c.lrc
    ].filter((x) => typeof x === "string" && x.trim());
    const syncedLrc = syncedCandidates.length ? String(syncedCandidates[0]).trim() : "";
    const plainCandidates = [
      json == null ? void 0 : json.plainLyrics,
      json == null ? void 0 : json.lyrics,
      (_d = json == null ? void 0 : json.data) == null ? void 0 : _d.plainLyrics,
      (_e = json == null ? void 0 : json.data) == null ? void 0 : _e.lyrics
    ].filter((x) => typeof x === "string" && x.trim());
    const plainLyrics = plainCandidates.length ? String(plainCandidates[0]).trim() : "";
    return { syncedLrc, plainLyrics };
  }
  async function fetchLyricsFromLrclib(params) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const { artist, title, durationSeconds, trackKey, signal, onDebug } = params;
    const debug = (() => {
      try {
        return localStorage.getItem("lyrify_debug") === "1";
      } catch (e) {
        return false;
      }
    })();
    const debugLog = (...args) => {
      if (!debug) return;
      console.log("[lyrify]", ...args);
    };
    const url = new URL(LRCLIB_GET_URL);
    url.searchParams.set("track_name", title);
    url.searchParams.set("artist_name", artist);
    if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) {
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
    const json = await res.json();
    const plainLyrics = (_a2 = json == null ? void 0 : json.plainLyrics) != null ? _a2 : "";
    const syncedLyrics = (_b = json == null ? void 0 : json.syncedLyrics) != null ? _b : null;
    debugLog("LRCLIB response:", {
      plainLen: (_c = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _c : 0,
      hasSynced: Boolean(syncedLyrics),
      syncedType: typeof syncedLyrics,
      firstPlain: (_d = plainLyrics == null ? void 0 : plainLyrics.slice(0, 120)) != null ? _d : "",
      firstSynced: (_e = syncedLyrics == null ? void 0 : syncedLyrics.slice(0, 120)) != null ? _e : ""
    });
    onDebug == null ? void 0 : onDebug({
      requestUrl: url.toString(),
      plainLen: (_f = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _f : 0,
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
    const lyrica = await fetchFromLyrica(artist, title, signal);
    const lyricaSynced = lyrica.syncedLrc ? parseSyncedLyricsLrc(lyrica.syncedLrc) : [];
    if (lyricaSynced.length > 0) {
      onDebug == null ? void 0 : onDebug({
        requestUrl: url.toString(),
        plainLen: (_g = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _g : 0,
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
      onDebug == null ? void 0 : onDebug({
        requestUrl: url.toString(),
        plainLen: (_h = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _h : 0,
        hasSynced: false,
        syncedLyricsType: typeof syncedLyrics,
        fallbackProvider: "lrclib-plain",
        fallbackPlainLen: (_i = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _i : 0,
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
      onDebug == null ? void 0 : onDebug({
        requestUrl: url.toString(),
        plainLen: (_j = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _j : 0,
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
    const fallbackPlain = await fetchPlainLyricsFallback(artist, title, signal);
    const fallbackLines = fallbackPlain ? parseUnsyncedLyricsPlain(fallbackPlain) : [];
    onDebug == null ? void 0 : onDebug({
      requestUrl: url.toString(),
      plainLen: (_k = plainLyrics == null ? void 0 : plainLyrics.length) != null ? _k : 0,
      hasSynced: false,
      syncedLyricsType: typeof syncedLyrics,
      fallbackProvider: "lyrics.ovh",
      fallbackPlainLen: (_l = fallbackPlain == null ? void 0 : fallbackPlain.length) != null ? _l : 0,
      fallbackHasSynced: false
    });
    return {
      trackKey,
      lines: fallbackLines,
      synced: false
    };
  }

  // src/cache.ts
  var CACHE_PREFIX = "lyrify_cache_";
  var MAX_CACHE_ENTRIES = 50;
  var CACHE_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
  var LyricsCache = class {
    static get(trackKey) {
      try {
        const raw = localStorage.getItem(CACHE_PREFIX + trackKey);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
          this.remove(trackKey);
          return null;
        }
        return entry.model;
      } catch (e) {
        return null;
      }
    }
    static set(trackKey, model) {
      try {
        const entry = {
          model,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_PREFIX + trackKey, JSON.stringify(entry));
        this.cleanup();
      } catch (e) {
      }
    }
    static remove(trackKey) {
      localStorage.removeItem(CACHE_PREFIX + trackKey);
    }
    static clear() {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
        keys.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
      }
    }
    static cleanup() {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => ({
          key: k,
          time: JSON.parse(localStorage.getItem(k) || "{}").timestamp || 0
        })).sort((a, b) => b.time - a.time);
        if (keys.length > MAX_CACHE_ENTRIES) {
          keys.slice(MAX_CACHE_ENTRIES).forEach((k) => localStorage.removeItem(k.key));
        }
      } catch (e) {
      }
    }
  };

  // src/selectors.ts
  var SPOTIFY_SELECTORS = {
    lyricsContainer: [
      '[data-testid*="lyrics"]',
      '[data-testid*="lyrics-drawer"]',
      '[class*="lyrics-lyricsContainer"]',
      '[class*="LyricsScrollContainer"]',
      '[class*="nowPlayingLyrics"]',
      '.main-nowPlayingView-section > div[class*="lyrics"]',
      'div[role="region"][aria-label*="Lyrics" i]',
      'div[aria-label*="Lyrics" i]',
      'aside[aria-label*="Lyrics" i]'
    ],
    lyricsLine: [
      '[data-testid*="lyrics-line"]',
      '[data-testid*="lyrics-line-text"]',
      '[class*="lyrics-line"]',
      '[class*="LyricsLine"]',
      '[class*="lyricsLine"]'
    ],
    lyricsButton: [
      '[data-testid*="lyrics-button"]',
      '[data-testid*="control-button-lyrics"]',
      'button[aria-label*="Lyrics" i]',
      'button[aria-label*="\u0422\u0435\u043A\u0441\u0442" i]'
    ],
    mainView: [
      '[data-testid="main-view"]',
      '[data-testid="now-playing-view"]',
      '[data-testid="npv-main-view"]',
      ".Root__right-sidebar .main-view-container",
      ".main-nowPlayingView-nowPlayingView",
      ".Root__main-view",
      ".main-view-container",
      "main"
    ],
    nowPlayingBar: '[data-testid="now-playing-bar"], .Root__now-playing-bar'
  };

  // src/components/InlineTrigger.ts
  function createInlineTrigger(onToggle) {
    const btn = h("button", {
      id: "lyrify-inline-trigger",
      type: "button",
      title: "Lyrify lyrics",
      className: "lyrify-btn",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }
    });
    btn.innerHTML = `
    <svg viewBox="0 0 16 16" style="width: 16px; height: 16px; fill: currentColor;">
      <path d="M3 4.2c0-.66.54-1.2 1.2-1.2h7.6c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2C3.54 5.4 3 4.86 3 4.2zm0 3.8c0-.66.54-1.2 1.2-1.2h7.6c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2C3.54 9 3 8.46 3 9zm0 3.8c0-.66.54-1.2 1.2-1.2h4.9c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2c-.66 0-1.2-.54-1.2-1.2z" />
    </svg>
  `;
    return btn;
  }
  function mountInlineTrigger(onToggle) {
    const selectors = SPOTIFY_SELECTORS.lyricsButton;
    let nativeBtn = null;
    for (const sel of selectors) {
      const list = Array.from(document.querySelectorAll(sel));
      for (const btn of list) {
        if (btn instanceof HTMLElement) {
          if (btn.closest(SPOTIFY_SELECTORS.nowPlayingBar)) {
            nativeBtn = btn;
            break;
          }
        }
      }
      if (nativeBtn) break;
    }
    if (!nativeBtn) return;
    let trigger = document.getElementById("lyrify-inline-trigger");
    if (!trigger) {
      trigger = createInlineTrigger(onToggle);
    }
    if (nativeBtn.parentElement && trigger.parentElement !== nativeBtn.parentElement) {
      nativeBtn.insertAdjacentElement("beforebegin", trigger);
    }
  }

  // src/components/NativeScraper.ts
  function findNativeLyricsContainerElements() {
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
    const scoreNativeLyricsContainer = (el) => {
      var _a2;
      const rect = el.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return 0;
      const text = ((_a2 = el.textContent) != null ? _a2 : "").replace(/\s+/g, " ").trim();
      if (text.length < 8) return 0;
      return text.length + Math.min(rect.width * rect.height / 800, 400);
    };
    const uniq = /* @__PURE__ */ new Map();
    for (const sel of sels) {
      document.querySelectorAll(sel).forEach((n) => {
        var _a2;
        if (!(n instanceof HTMLElement)) return;
        const sc = scoreNativeLyricsContainer(n);
        if (sc <= 0) return;
        const prev = (_a2 = uniq.get(n)) != null ? _a2 : 0;
        if (sc > prev) uniq.set(n, sc);
      });
    }
    return Array.from(uniq.entries()).sort((a, b) => b[1] - a[1]).map(([el]) => el);
  }
  function extractLinesFromNativeContainer(container) {
    var _a2, _b;
    const rowSelectors = [
      '[data-testid*="lyrics-line"]',
      '[data-testid*="lyrics-line-text"]',
      '[data-testid="fullscreen-lyric"]',
      '[class*="lyrics-line"]',
      '[class*="LyricsLine"]',
      '[class*="lyricsLine"]',
      'p[dir="auto"]'
    ];
    const dedupeLyricLines = (lines) => {
      var _a3, _b2;
      const out = [];
      let last = "";
      for (const l of lines) {
        const t = ((_a3 = l.text) != null ? _a3 : "").replace(/\s+/g, " ").trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (key === last) continue;
        last = key;
        out.push({ text: t, startTime: (_b2 = l.startTime) != null ? _b2 : null });
      }
      return out;
    };
    for (const sel of rowSelectors) {
      const nodes = Array.from(container.querySelectorAll(sel));
      if (nodes.length === 0) continue;
      const raw = [];
      for (const n of nodes) {
        if (!(n instanceof HTMLElement)) continue;
        const t = ((_a2 = n.textContent) != null ? _a2 : "").replace(/\s+/g, " ").trim();
        if (!t || t.length > 900) continue;
        raw.push({ text: t, startTime: null });
      }
      const deduped = dedupeLyricLines(raw);
      if (deduped.length > 0) return deduped;
    }
    const plain = ((_b = container.textContent) != null ? _b : "").trim();
    if (!plain) return [];
    const byNl = plain.split(/\n+/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (byNl.length > 1) return byNl.map((text) => ({ text, startTime: null }));
    return [{ text: plain.replace(/\s+/g, " ").trim(), startTime: null }];
  }
  function tryClickSpotifyLyricsButton() {
    const primarySelectors = [
      '[data-testid*="lyrics-button"]',
      '[data-testid*="control-button-lyrics"]',
      'button[aria-label*="Lyrics" i]',
      'button[aria-label*="\u0422\u0435\u043A\u0441\u0442" i]',
      'button[title*="Lyrics" i]',
      'button[title*="\u0422\u0435\u043A\u0441\u0442" i]'
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
  async function tryFetchNativeSpotifyUiLyrics(options) {
    const { signal, restoreNativeLyrics, hideNativeLyrics, overlayIsOpen } = options;
    let triedOpenPanel = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      if (signal == null ? void 0 : signal.aborted) break;
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

  // src/manualSync.ts
  function createManualSyncController(options) {
    let currentLines = options.lines;
    const { getProgressMs, setLineStartTime } = options;
    let recording = false;
    let locked = false;
    let currentIndex = 0;
    const history = [];
    const nextIndex = (from) => {
      var _a2, _b;
      for (let i = from + 1; i < currentLines.length; i++) {
        if ((_b = (_a2 = currentLines[i]) == null ? void 0 : _a2.text) == null ? void 0 : _b.trim()) return i;
      }
      return from;
    };
    const recordAtCurrent = () => {
      var _a2, _b, _c, _d, _e;
      if (!recording || locked) return;
      if (!((_b = (_a2 = currentLines[currentIndex]) == null ? void 0 : _a2.text) == null ? void 0 : _b.trim())) {
        currentIndex = nextIndex(currentIndex);
      }
      const t = getProgressMs();
      const prev = (_c = currentLines[currentIndex]) == null ? void 0 : _c.startTime;
      const prevStartTime = typeof prev === "number" ? prev : null;
      history.push({ index: currentIndex, prevStartTime, stampedTime: t, prevCurrentIndex: currentIndex });
      setLineStartTime(currentIndex, t);
      (_d = options.onRecord) == null ? void 0 : _d.call(options, currentIndex, t);
      currentIndex = nextIndex(currentIndex);
      (_e = options.onIndexChange) == null ? void 0 : _e.call(options, currentIndex);
    };
    const undoLast = () => {
      var _a2;
      if (!recording || locked) return;
      const last = history.pop();
      if (!last) return;
      setLineStartTime(last.index, last.prevStartTime);
      currentIndex = last.index;
      (_a2 = options.onIndexChange) == null ? void 0 : _a2.call(options, currentIndex);
    };
    const onKeyDown = (e) => {
      if (!recording) return;
      const isEnter = e.code === "Enter" || e.key === "Enter";
      const isSpace = e.code === "Space" || e.key === " " || e.key === "Spacebar";
      const k = (e.key || "").toLowerCase();
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const isUndo = e.code === "Backspace" || e.key === "Backspace" || (e.metaKey || e.ctrlKey) && (k === "z" || k === "\u044F");
      if (isEnter || isSpace) {
        e.preventDefault();
        e.stopPropagation();
        recordAtCurrent();
        return;
      }
      if (isUndo) {
        e.preventDefault();
        e.stopPropagation();
        undoLast();
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false, capture: true });
    return {
      isRecording: () => recording,
      start: (initialIndex) => {
        var _a2, _b;
        recording = true;
        history.splice(0, history.length);
        if (typeof initialIndex === "number" && Number.isFinite(initialIndex)) currentIndex = initialIndex;
        (_a2 = options.onIndexChange) == null ? void 0 : _a2.call(options, currentIndex);
        (_b = options.onStart) == null ? void 0 : _b.call(options);
      },
      stop: () => {
        var _a2;
        recording = false;
        (_a2 = options.onStop) == null ? void 0 : _a2.call(options);
      },
      undo: () => {
        undoLast();
      },
      setCurrentIndex: (index) => {
        var _a2;
        if (index < 0 || index >= currentLines.length) return;
        currentIndex = index;
        (_a2 = options.onIndexChange) == null ? void 0 : _a2.call(options, currentIndex);
      },
      getCurrentIndex: () => currentIndex,
      updateLines: (newLines) => {
        var _a2;
        currentLines = newLines;
        currentIndex = 0;
        history.splice(0, history.length);
        if (recording) (_a2 = options.onIndexChange) == null ? void 0 : _a2.call(options, currentIndex);
      },
      setLocked: (l) => {
        locked = l;
      },
      isLocked: () => locked,
      recordAtCurrent: () => {
        recordAtCurrent();
      }
    };
  }

  // src/index.ts
  var BACKEND_BASE_URL = "https://lyrify-api.aquashield.lol";
  async function backendGetSync(trackKey, signal) {
    const url = new URL(`${BACKEND_BASE_URL}/sync`);
    url.searchParams.set("trackKey", trackKey);
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return null;
    const json = await res.json();
    return (json == null ? void 0 : json.found) ? json.record : null;
  }
  async function fetchSpotifyApiLyrics(uri, debugLogger) {
    var _a2, _b, _c, _d;
    if (!uri) {
      debugLogger == null ? void 0 : debugLogger("API Fetch: No URI provided.");
      return null;
    }
    const trackId = uri.split(":").pop();
    if (!trackId) {
      debugLogger == null ? void 0 : debugLogger("API Fetch: Could not parse trackId from URI.");
      return null;
    }
    try {
      const cosmos = (_a2 = window.Spicetify) == null ? void 0 : _a2.CosmosAsync;
      if (!cosmos) {
        debugLogger == null ? void 0 : debugLogger("API Fetch: CosmosAsync not available.");
        return null;
      }
      let res;
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
            successEndpoint = ep.split("?")[0];
            break;
          }
        } catch (err) {
        }
      }
      if (!res || !res.lyrics) {
        const platformLyrics = (_c = (_b = window.Spicetify) == null ? void 0 : _b.Platform) == null ? void 0 : _c.LyricsAPI;
        if (platformLyrics && platformLyrics.getLyrics) {
          try {
            const l = await platformLyrics.getLyrics(trackId);
            if (l && l.lyrics) {
              res = l;
              successEndpoint = "Platform.LyricsAPI";
            }
          } catch (e) {
          }
        }
      }
      if (!res || !res.lyrics || !res.lyrics.lines) {
        debugLogger == null ? void 0 : debugLogger("API Fetch: Failed on all known endpoints.");
        return null;
      }
      debugLogger == null ? void 0 : debugLogger(`API Fetch: Success via ${successEndpoint}`);
      const linesList = res.lyrics.lines;
      if (!Array.isArray(linesList)) return null;
      const out = [];
      let hasSync = false;
      for (const line of linesList) {
        const text = ((_d = line.words) != null ? _d : "").trim();
        if (!text && line.words !== "") continue;
        const ms = line.startTimeMs ? parseInt(line.startTimeMs, 10) : null;
        if (ms !== null && !isNaN(ms) && ms > 0) hasSync = true;
        out.push({ text, startTime: ms !== null && !isNaN(ms) ? ms : null });
      }
      return out.length > 0 ? { lines: out, synced: hasSync } : null;
    } catch (e) {
      return null;
    }
  }
  var isStarted = false;
  var currentFetchAbort = null;
  var highlightTimer = null;
  var miniOpen = false;
  async function startExtension() {
    var _a2, _b, _c, _d;
    if (isStarted) return;
    isStarted = true;
    try {
      const w = window;
      const currentSettings = state.getSettings();
      if (!currentSettings.nickname) {
        const randomNick = generateRandomNickname();
        state.saveSettings({ nickname: randomNick });
      }
      const authorId = getOrCreateAuthorId();
      let isScrubbingNative = false;
      if (!document.getElementById(CSS_ID)) {
        const style = document.createElement("style");
        style.id = CSS_ID;
        style.textContent = STYLES;
        document.head.appendChild(style);
      }
      setTimeout(() => {
        try {
          fetch(`${BACKEND_BASE_URL}/telemetry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              authorId: getOrCreateAuthorId(),
              authorNickname: readUiSettings().nickname || void 0
            })
          }).catch(() => {
          });
        } catch (e) {
        }
      }, 3e3);
      const manual = createManualSyncController({
        lines: state.getLyrics().lines,
        // will be updated in-place via mutations or proxy
        getProgressMs: () => w.Spicetify.Player.getProgress(),
        setLineStartTime: (idx, time) => {
          const l = state.getLyrics();
          if (l.lines[idx]) {
            l.lines[idx].startTime = time;
            state.setLyrics({ ...l });
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
            overlay.updateRecordHudTrack(`${info.artist} \u2014 ${info.title}`, lyrics.synced);
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
            overlay.updateRecordHudTrack(`${info.artist || "?"} \u2014 ${info.title || "?"}`, lyrics.synced);
            overlay.showRecordHud();
          }
        } else if (hasLines && !hadManualLines) {
          hadManualLines = true;
          manual.updateLines(lyrics.lines);
          if (manual.isRecording()) {
            const info = observer.getTrackInfo();
            overlay.updateRecordHudTrack(`${info.artist || "?"} \u2014 ${info.title || "?"}`, lyrics.synced);
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
          const s = state.getSettings();
          const authorId2 = getOrCreateAuthorId();
          const authorNickname = s.nickname || void 0;
          const res = await fetch(`${BACKEND_BASE_URL}/submission`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackKey: key, lines, authorId: authorId2, authorNickname })
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
        const hasTimed = lyrics.lines.some((l) => l.startTime !== null);
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
      const updateTriggerButtonState = (isOpen) => {
        const btn = document.getElementById("lyrify-inline-trigger");
        if (btn) btn.classList.toggle("s-active", isOpen);
      };
      const loadLyrics = async (autoOpen, retryCount = 0, expectedUri) => {
        if (currentFetchAbort) currentFetchAbort.abort();
        currentFetchAbort = new AbortController();
        const signal = currentFetchAbort.signal;
        const info = observer.getTrackInfo();
        if (!info.artist || !info.title) {
          if (retryCount < 30) {
            setTimeout(() => loadLyrics(autoOpen, retryCount + 1, expectedUri), 500);
          }
          return;
        }
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
        overlay.setHeader(`${info.artist} \u2014 ${info.title}`);
        overlay.updateRecordHudTrack(`${info.artist} \u2014 ${info.title}`, false);
        overlay.applyAccentColor(info.imageUrl);
        state.setLyrics({ trackKey, lines: [], synced: false });
        overlay.setMeta("");
        let debugDetails = `Extracted: artist="${info.artist}"
title="${info.title}"
trackKey="${trackKey}"
relaxedTrackKey="${relaxedKey}"`;
        overlay.setDebug(debugDetails);
        overlay.render(miniOpen);
        const addDebug = (msg) => {
          if (signal.aborted) return;
          debugDetails += `

${msg}`;
          overlay.setDebug(debugDetails);
        };
        const sendMissingPing = (trackKey2, artist, title) => {
          fetch(`${BACKEND_BASE_URL}/track-missing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackKey: trackKey2, artist, title })
          }).catch(() => {
          });
        };
        const sendRequestSyncPing = (trackKey2, artist, title) => {
          fetch(`${BACKEND_BASE_URL}/request-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackKey: trackKey2, artist, title })
          }).catch(() => {
          });
        };
        const sendPlayPing = (trackKey2, artist, title, hasSynced, uri) => {
          fetch(`${BACKEND_BASE_URL}/track-play`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackKey: trackKey2, artist, title, hasSynced, uri, authorId: getOrCreateAuthorId() })
          }).catch(() => {
          });
        };
        try {
          const cached = LyricsCache.get(trackKey) || LyricsCache.get(relaxedKey);
          if (cached && cached.lines.length > 0) {
            if (signal.aborted) return;
            state.setLyrics(cached);
            addDebug(`Source: Cache
TrackKey: ${cached.trackKey}`);
            if (cached.synced) ensureHighlightTimer();
            overlay.render(miniOpen);
            sendPlayPing(trackKey, info.artist, info.title, cached.synced, info.uri);
            return;
          }
          let bestScore = -1;
          overlay.setLoading(true);
          const tryApply = (model, score, sourceName) => {
            if (signal.aborted) return;
            if (score <= bestScore) return;
            bestScore = score;
            state.setLyrics(model);
            LyricsCache.set(trackKey, model);
            addDebug(`Source: ${sourceName}
Synced: ${model.synced}
Lines: ${model.lines.length}`);
            if (model.synced) ensureHighlightTimer();
            overlay.render(miniOpen);
          };
          const s = readUiSettings();
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
            } catch (e) {
              addDebug(`Backend error: ${e}`);
            }
          })();
          const lrclibPromise = (async () => {
            try {
              const m = await fetchLyricsFromLrclib({
                artist: info.artist,
                title: info.title,
                durationSeconds: info.durationSeconds,
                trackKey,
                signal,
                onDebug: (dbg) => {
                  var _a3;
                  return addDebug(`LRCLIB: plain=${dbg.plainLen} synced=${dbg.hasSynced} fallback=${(_a3 = dbg.fallbackProvider) != null ? _a3 : "-"}`);
                }
              });
              if (m && m.lines.length > 0 && !signal.aborted) {
                if (m.synced) {
                  tryApply(m, 50, "LRCLIB (Synced)");
                } else {
                  tryApply({ ...m, trackKey, synced: false }, 10, "LRCLIB (Plain)");
                }
              }
            } catch (e) {
              addDebug(`LRCLIB error: ${e}`);
            }
          })();
          const spotifyPromise = (async () => {
            try {
              const raw = await fetchSpotifyApiLyrics(info.uri, addDebug);
              if (raw && raw.lines.length > 0 && !signal.aborted) {
                const m = { ...raw, trackKey };
                if (m.synced) {
                  tryApply(m, 50, "Spotify API (Synced)");
                } else {
                  tryApply({ ...m, synced: false }, 10, "Spotify API (Plain)");
                }
              }
            } catch (e) {
              addDebug(`Spotify error: ${e}`);
            }
          })();
          await Promise.allSettled([backendPromise, lrclibPromise, spotifyPromise]);
          if (signal.aborted) return;
          const finalLyrics = state.getLyrics();
          if (finalLyrics.trackKey === trackKey && finalLyrics.lines.length > 0 && bestScore >= 0) {
            sendPlayPing(trackKey, info.artist, info.title, finalLyrics.synced, info.uri);
            return;
          }
          addDebug("No API lyrics, trying native DOM scraper...");
          try {
            isScrubbingNative = true;
            const nativeLines = await tryFetchNativeSpotifyUiLyrics({
              signal,
              restoreNativeLyrics: () => {
                var _a3, _b2, _c2, _d2;
                return (_d2 = (_c2 = (_b2 = (_a3 = window.Spicetify) == null ? void 0 : _a3.Player) == null ? void 0 : _b2.origin) == null ? void 0 : _c2.restoreNativeLyrics) == null ? void 0 : _d2.call(_c2);
              },
              hideNativeLyrics: () => {
                var _a3, _b2, _c2, _d2;
                return (_d2 = (_c2 = (_b2 = (_a3 = window.Spicetify) == null ? void 0 : _a3.Player) == null ? void 0 : _b2.origin) == null ? void 0 : _c2.hideNativeLyrics) == null ? void 0 : _d2.call(_c2);
              },
              overlayIsOpen: () => overlay.element.style.display !== "none"
            });
            if (nativeLines.length > 0) {
              if (signal.aborted) return;
              state.setLyrics({ trackKey, lines: nativeLines, synced: false });
              addDebug(`Source: Spotify UI
Lines: ${nativeLines.length}`);
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
          addDebug(`Source: None
Status: 404`);
          overlay.setLoading(false);
          state.setLyrics({
            trackKey,
            lines: [{ text: "\u041A\u0430\u0436\u0435\u0442\u0441\u044F, \u043C\u044B \u043D\u0435 \u043D\u0430\u0448\u043B\u0438 \u0442\u0435\u043A\u0441\u0442 \u043A \u044D\u0442\u043E\u0439 \u043F\u0435\u0441\u043D\u0435 :(", startTime: null }],
            synced: false,
            isNotFound: true
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
            overlay.resetSplitView();
            updateTriggerButtonState(false);
          }
        });
        updateTriggerButtonState(overlay.element.style.display !== "none");
      };
      state.subscribe(() => {
        overlay.render(miniOpen);
        miniPlayer.render();
      });
      const hideOnNav = () => {
        var _a3, _b2, _c2, _d2;
        if (isScrubbingNative) return;
        overlay.element.style.display = "none";
        miniOpen = false;
        if (miniPlayer.element) miniPlayer.element.classList.remove("s-open");
        updateTriggerButtonState(false);
        (_d2 = (_c2 = (_b2 = (_a3 = window.Spicetify) == null ? void 0 : _a3.Player) == null ? void 0 : _b2.origin) == null ? void 0 : _c2.restoreNativeLyrics) == null ? void 0 : _d2.call(_c2);
      };
      const platHist = (_b = (_a2 = w.Spicetify) == null ? void 0 : _a2.Platform) == null ? void 0 : _b.History;
      if (platHist == null ? void 0 : platHist.listen) {
        platHist.listen(() => {
          hideOnNav();
        });
      }
      if ((_d = (_c = w.Spicetify) == null ? void 0 : _c.History) == null ? void 0 : _d.listen) {
        w.Spicetify.History.listen(() => {
          hideOnNav();
        });
      }
      mountAll();
      loadLyrics(false);
      let startupFallbackFired = false;
      const startupFallback = () => {
        if (!startupFallbackFired && state.getLyrics().lines.length === 0) {
          startupFallbackFired = true;
          loadLyrics(false);
        }
      };
      w.Spicetify.Player.addEventListener("onplaypause", startupFallback);
      setTimeout(() => {
        startupFallbackFired = true;
      }, 2e4);
      const debouncedMount = debounceByAnimationFrame(() => mountAll());
      const domObserver = new MutationObserver(() => debouncedMount());
      domObserver.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("keydown", (e) => {
        if (!manual.isRecording()) return;
        const isSpace = e.code === "Space" || e.key === " ";
        if (isSpace) {
        }
      }, { capture: true });
    } catch (err) {
      console.error("[lyrify] Startup failed:", err);
      isStarted = false;
    }
  }
  window.lyrify_settings = readUiSettings();
  window.__lyrify_start = startExtension;
  var _a;
  if ((_a = window.Spicetify) == null ? void 0 : _a.Player) {
    setTimeout(startExtension, 500);
  } else {
    const tick = () => {
      var _a2;
      if ((_a2 = window.Spicetify) == null ? void 0 : _a2.Player) setTimeout(startExtension, 500);
      else setTimeout(tick, 200);
    };
    tick();
  }
})();
//# sourceMappingURL=lyrics-sync.js.map
