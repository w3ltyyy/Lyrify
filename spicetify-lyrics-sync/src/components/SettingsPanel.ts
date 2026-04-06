import { h } from "../domUtils";
import { ManualSyncController } from "../manualSync";

export const LS_UI_FONT = "lyrify_ui_font_px";
export const LS_UI_BLUR = "lyrify_ui_blur_px";
export const LS_UI_BRIGHT = "lyrify_ui_brightness";
export const LS_UI_AUTO = "lyrify_ui_auto_scroll";
export const LS_UI_DEBUG = "lyrify_ui_show_debug";
export const LS_UI_FULLSCREEN = "lyrify_ui_fullscreen";
export const LS_UI_AUTOGEN = "lyrify_ui_autogen_sync";
export const LS_UI_LINE_GAP = "lyrify_ui_line_gap";
export const LS_UI_MAX_W = "lyrify_ui_max_width";
export const LS_UI_INACTIVE_OP = "lyrify_ui_inactive_op_pct";
export const LS_UI_EDGE_FADE = "lyrify_ui_edge_fade";
export const LS_UI_VIBRANT = "lyrify_ui_vibrant";
export const LS_CONTRIBUTOR_NICKNAME = "lyrify_contributor_nickname";

export function readUiSettings() {
  return {
    fontPx: Math.min(52, Math.max(22, Number(localStorage.getItem(LS_UI_FONT) || "35") || 35)),
    blurPx: Math.min(16, Math.max(0, Number(localStorage.getItem(LS_UI_BLUR) || "0") || 0)),
    brightness: Math.min(1.35, Math.max(0.75, Number(localStorage.getItem(LS_UI_BRIGHT) || "1") || 1)),
    autoScroll: localStorage.getItem(LS_UI_AUTO) !== "0",
    showDebug: localStorage.getItem(LS_UI_DEBUG) === "1",
    fullscreen: localStorage.getItem(LS_UI_FULLSCREEN) !== "0",
    autoGenerate: localStorage.getItem(LS_UI_AUTOGEN) !== "0",
    lineGapPx: Math.min(28, Math.max(8, Number(localStorage.getItem(LS_UI_LINE_GAP) || "14") || 14)),
    maxWidthPx: Math.min(960, Math.max(480, Number(localStorage.getItem(LS_UI_MAX_W) || "720") || 720)),
    inactiveOpacityPct: Math.min(55, Math.max(15, Number(localStorage.getItem(LS_UI_INACTIVE_OP) || "38") || 38)),
    edgeFade: localStorage.getItem(LS_UI_EDGE_FADE) !== "0",
    vibrant: localStorage.getItem(LS_UI_VIBRANT) === "1",
    nickname: localStorage.getItem(LS_CONTRIBUTOR_NICKNAME) || ""
  };
}

export function createSettingsPanel(targetOverlay?: HTMLElement, onClearCache?: () => void, manualSync?: ManualSyncController) {
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

  const row = (label: string, control: HTMLElement, val: HTMLElement) => {
    const r = h("div", { className: "lyrify-setting-row" });
    const l = h("label", {}, label);
    r.appendChild(l);
    r.appendChild(control);
    r.appendChild(val);
    return r;
  };

  const fontRange = h("input", { type: "range", min: "22", max: "52", step: "1" }) as HTMLInputElement;
  const fontVal = h("span", { className: "lyrify-setting-val" });
  
  const blurRange = h("input", { type: "range", min: "0", max: "16", step: "1" }) as HTMLInputElement;
  const blurVal = h("span", { className: "lyrify-setting-val" });
  
  const brightRange = h("input", { type: "range", min: "75", max: "135", step: "1" }) as HTMLInputElement;
  const brightVal = h("span", { className: "lyrify-setting-val" });

  const autoScrollCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const showDebugCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const fullscreenCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const autogenCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const edgeFadeCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const vibrantCb = h("input", { type: "checkbox" }) as HTMLInputElement;
  const recordCb = h("input", { type: "checkbox" }) as HTMLInputElement;

  const lineGapRange = h("input", { type: "range", min: "8", max: "28", step: "1" }) as HTMLInputElement;
  const lineGapVal = h("span", { className: "lyrify-setting-val" });

  const maxWidthRange = h("input", { type: "range", min: "480", max: "960", step: "10" }) as HTMLInputElement;
  const maxWidthVal = h("span", { className: "lyrify-setting-val" });

  const inactiveOpRange = h("input", { type: "range", min: "15", max: "55", step: "1" }) as HTMLInputElement;
  const inactiveOpVal = h("span", { className: "lyrify-setting-val" });

  const nicknameInput = h("input", { type: "text", maxLength: "32", placeholder: "Anonymous", className: "lyrify-setting-text" }) as HTMLInputElement;

  generalSection.appendChild(row("Text size", fontRange, fontVal));
  generalSection.appendChild(row("Background blur", blurRange, blurVal));
  generalSection.appendChild(row("Brightness", brightRange, brightVal));
  generalSection.appendChild(row("Auto-scroll", autoScrollCb, h("span")));
  generalSection.appendChild(row("Show debug", showDebugCb, h("span")));
  generalSection.appendChild(row("Fullscreen", fullscreenCb, h("span")));
  generalSection.appendChild(row("Contributor Nickname", nicknameInput, h("span")));

  appearanceSection.appendChild(h("div", { className: "lyrify-settings-subtitle" }, "Lyrics column"));
  appearanceSection.appendChild(row("Line spacing", lineGapRange, lineGapVal));
  appearanceSection.appendChild(row("Max width", maxWidthRange, maxWidthVal));
  appearanceSection.appendChild(row("Inactive dim", inactiveOpRange, inactiveOpVal));
  appearanceSection.appendChild(row("Edge fade", edgeFadeCb, h("span")));
  appearanceSection.appendChild(row("Vibrant backgrounds", vibrantCb, h("span")));

  syncSection.appendChild(h("div", { className: "lyrify-settings-subtitle" }, "Sync engine"));
  syncSection.appendChild(row("Auto-generate", autogenCb, h("span")));
  if (manualSync) {
      syncSection.appendChild(row("Recording Mode", recordCb, h("span")));
  }

  const clearCacheBtn = h("button", { 
    id: "lyrify-clear-cache", 
    className: "lyrify-btn",
    style: { marginTop: "20px", width: "100%", justifyContent: "center" }
  }, "🧹 Clear Lyrics Cache");

  clearCacheBtn.onclick = () => {
    if (onClearCache) {
      clearCacheBtn.classList.add("s-puff");
      setTimeout(() => clearCacheBtn.classList.remove("s-puff"), 600);
      onClearCache();
    }
  };
  syncSection.appendChild(clearCacheBtn);

  const syncSettingsControls = (explicitTarget?: HTMLElement) => {
    const s = readUiSettings();
    (window as any).lyrify_settings = s;
    fontRange.value = String(s.fontPx);
    fontVal.textContent = String(s.fontPx);
    blurRange.value = String(s.blurPx);
    blurVal.textContent = String(s.blurPx);
    brightRange.value = String(Math.round(s.brightness * 100));
    brightVal.textContent = `${Math.round(s.brightness * 100)}%`;
    autoScrollCb.checked = s.autoScroll;
    showDebugCb.checked = s.showDebug;
    fullscreenCb.checked = s.fullscreen;
    autogenCb.checked = s.autoGenerate;
    edgeFadeCb.checked = s.edgeFade;
    vibrantCb.checked = s.vibrant;
    lineGapRange.value = String(s.lineGapPx);
    lineGapVal.textContent = `${s.lineGapPx}px`;
    maxWidthRange.value = String(s.maxWidthPx);
    maxWidthVal.textContent = `${s.maxWidthPx}px`;
    inactiveOpRange.value = String(s.inactiveOpacityPct);
    inactiveOpVal.textContent = `${s.inactiveOpacityPct}%`;
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
        target.classList.toggle("s-fullscreen", s.fullscreen);
        target.classList.toggle("s-vibrant-enabled", s.vibrant);
        
        const scrollWrap = target.querySelector("#lyrify-scroll-wrap") || document.getElementById("lyrify-scroll-wrap");
        if (scrollWrap instanceof HTMLElement) scrollWrap.classList.toggle("s-fade-disabled", !s.edgeFade);

        const debugEl = target.querySelector("#lyrify-debug-info") || document.getElementById("lyrify-debug-info");
        if (debugEl instanceof HTMLElement) debugEl.style.display = s.showDebug ? "block" : "none";
    }
  };

  const persist = () => {
    localStorage.setItem(LS_UI_FONT, fontRange.value);
    localStorage.setItem(LS_UI_BLUR, blurRange.value);
    localStorage.setItem(LS_UI_BRIGHT, String(Number(brightRange.value) / 100));
    localStorage.setItem(LS_UI_AUTO, autoScrollCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_DEBUG, showDebugCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_FULLSCREEN, fullscreenCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_AUTOGEN, autogenCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_EDGE_FADE, edgeFadeCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_VIBRANT, vibrantCb.checked ? "1" : "0");
    localStorage.setItem(LS_UI_LINE_GAP, lineGapRange.value);
    localStorage.setItem(LS_UI_MAX_W, maxWidthRange.value);
    localStorage.setItem(LS_UI_INACTIVE_OP, inactiveOpRange.value);
    localStorage.setItem(LS_CONTRIBUTOR_NICKNAME, nicknameInput.value.trim());
    
    (window as any).lyrify_settings = readUiSettings();
    syncSettingsControls();
  };

  [fontRange, blurRange, brightRange, lineGapRange, maxWidthRange, inactiveOpRange].forEach(input => input.oninput = persist);
  [autoScrollCb, showDebugCb, fullscreenCb, autogenCb, edgeFadeCb, vibrantCb].forEach(cb => cb.onchange = persist);
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

  const addNav = (lab: string, targetId: string) => {
    const b = h("button", { className: "lyrify-settings-cat-btn" }, lab);
    b.onclick = () => {
        [generalSection, appearanceSection, syncSection].forEach(s => s.style.display = s.id === targetId ? "" : "none");
        Array.from(nav.children).forEach(child => (child as HTMLElement).classList.toggle("is-active", child === b));
    };
    nav.appendChild(b);
  };
  addNav("General", "lyrify-cat-general");
  addNav("Appearance", "lyrify-cat-appearance");
  addNav("Sync", "lyrify-cat-sync");
  if (nav.children[0]) (nav.children[0] as HTMLElement).classList.add("is-active");
  [appearanceSection, syncSection].forEach(s => s.style.display = "none");

  syncSettingsControls();

  return {
    element: panel,
    toggle: () => panel.classList.toggle("s-open"),
    syncSettings: syncSettingsControls
  };
}
