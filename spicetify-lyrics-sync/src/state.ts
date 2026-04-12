import type { LyricsModel } from "./syncModel";

export type Settings = {
  fontPx: number;
  blurPx: number;
  brightness: number;
  autoScroll: boolean;
  showDebug: boolean;
  fullscreen: boolean;
  autoGenerate: boolean;
  lineGapPx: number;
  maxWidthPx: number;
  inactiveOpacityPct: number;
  edgeFade: boolean;
  nickname: string;
  vibrant: boolean;
  highlightActive: boolean;
};

export const LS_KEYS = {
  FONT: "lyrify_ui_font_px",
  BLUR: "lyrify_ui_blur_px",
  BRIGHT: "lyrify_ui_brightness",
  AUTO: "lyrify_ui_auto_scroll",
  DEBUG: "lyrify_ui_show_debug",
  FULLSCREEN: "lyrify_ui_fullscreen",
  AUTOGEN: "lyrify_ui_autogen_sync",
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

export const DEFAULT_SETTINGS: Settings = {
  fontPx: 35,
  blurPx: 0,
  brightness: 1,
  autoScroll: true,
  showDebug: false,
  fullscreen: true,
  autoGenerate: true,
  lineGapPx: 14,
  maxWidthPx: 720,
  inactiveOpacityPct: 38,
  edgeFade: true,
  nickname: "",
  vibrant: false,
  highlightActive: true
};

class StateManager {
  private lyrics: LyricsModel = { trackKey: "", lines: [], synced: false };
  private activeIndex: number = -1;
  private settings: Settings = { ...DEFAULT_SETTINGS };
  private listeners: Set<() => void> = new Set();

  constructor() {
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
        autoGenerate: localStorage.getItem(LS_KEYS.AUTOGEN) !== "0",
        lineGapPx: Math.min(28, Math.max(8, Number(localStorage.getItem(LS_KEYS.LINE_GAP) || "14") || 14)),
        maxWidthPx: Math.min(960, Math.max(480, Number(localStorage.getItem(LS_KEYS.MAX_W) || "720") || 720)),
        inactiveOpacityPct: Math.min(55, Math.max(15, Number(localStorage.getItem(LS_KEYS.INACTIVE_OP) || "38") || 38)),
        edgeFade: localStorage.getItem(LS_KEYS.EDGE_FADE) !== "0",
        nickname: localStorage.getItem("lyrify_contributor_nickname") || "",
        vibrant: localStorage.getItem(LS_KEYS.VIBRANT) === "1",
        highlightActive: localStorage.getItem(LS_KEYS.HIGHLIGHT_ACTIVE) !== "0"
      };
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings(newSettings: Partial<Settings>) {
    Object.assign(this.settings, newSettings);
    try {
      if (newSettings.fontPx !== undefined) localStorage.setItem(LS_KEYS.FONT, String(newSettings.fontPx));
      if (newSettings.blurPx !== undefined) localStorage.setItem(LS_KEYS.BLUR, String(newSettings.blurPx));
      if (newSettings.brightness !== undefined) localStorage.setItem(LS_KEYS.BRIGHT, String(newSettings.brightness));
      if (newSettings.autoScroll !== undefined) localStorage.setItem(LS_KEYS.AUTO, newSettings.autoScroll ? "1" : "0");
      if (newSettings.showDebug !== undefined) localStorage.setItem(LS_KEYS.DEBUG, newSettings.showDebug ? "1" : "0");
      if (newSettings.fullscreen !== undefined) localStorage.setItem(LS_KEYS.FULLSCREEN, newSettings.fullscreen ? "1" : "0");
      if (newSettings.autoGenerate !== undefined) localStorage.setItem(LS_KEYS.AUTOGEN, newSettings.autoGenerate ? "1" : "0");
      if (newSettings.lineGapPx !== undefined) localStorage.setItem(LS_KEYS.LINE_GAP, String(newSettings.lineGapPx));
      if (newSettings.maxWidthPx !== undefined) localStorage.setItem(LS_KEYS.MAX_W, String(newSettings.maxWidthPx));
      if (newSettings.inactiveOpacityPct !== undefined) localStorage.setItem(LS_KEYS.INACTIVE_OP, String(newSettings.inactiveOpacityPct));
      if (newSettings.edgeFade !== undefined) localStorage.setItem(LS_KEYS.EDGE_FADE, newSettings.edgeFade ? "1" : "0");
      if (newSettings.nickname !== undefined) localStorage.setItem("lyrify_contributor_nickname", newSettings.nickname);
      if (newSettings.vibrant !== undefined) localStorage.setItem(LS_KEYS.VIBRANT, newSettings.vibrant ? "1" : "0");
      if (newSettings.highlightActive !== undefined) localStorage.setItem(LS_KEYS.HIGHLIGHT_ACTIVE, newSettings.highlightActive ? "1" : "0");
    } catch {
      // ignore
    }
    this.notify();
  }

  getLyrics() { return this.lyrics; }
  setLyrics(lyrics: LyricsModel) {
    this.lyrics = lyrics;
    this.notify();
  }

  getActiveIndex() { return this.activeIndex; }
  setActiveIndex(index: number) {
    if (this.activeIndex === index) return;
    this.activeIndex = index;
    this.notify();
  }

  getSettings() { return this.settings; }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const state = new StateManager();
