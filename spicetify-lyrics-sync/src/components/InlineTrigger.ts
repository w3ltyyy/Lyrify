import { h } from "../domUtils";
import { SPOTIFY_SELECTORS } from "../selectors";

export function createInlineTrigger(onToggle: () => void) {
  const btn = h("button", {
    id: "lyrify-inline-trigger",
    type: "button",
    title: "Lyrify lyrics",
    className: "lyrify-btn",
    onclick: (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }
  });

  // Use innerHTML for SVG to avoid document.createElementNS and type errors with h()
  btn.innerHTML = `
    <svg viewBox="0 0 16 16" style="width: 16px; height: 16px; fill: currentColor;">
      <path d="M3 4.2c0-.66.54-1.2 1.2-1.2h7.6c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2C3.54 5.4 3 4.86 3 4.2zm0 3.8c0-.66.54-1.2 1.2-1.2h7.6c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2C3.54 9 3 8.46 3 9zm0 3.8c0-.66.54-1.2 1.2-1.2h4.9c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2H4.2c-.66 0-1.2-.54-1.2-1.2z" />
    </svg>
  `;

  return btn;
}

export function mountInlineTrigger(onToggle: () => void) {
  const selectors = SPOTIFY_SELECTORS.lyricsButton;
  let nativeBtn: HTMLElement | null = null;

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
