export const CSS_ID = "lyrify-lyrics-sync-styles";

export const STYLES = `
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
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 100000;
      opacity: 0;
      transition: all 0.2s ease;
    }
    #lyrify-overlay.s-split-view.s-mouse-active .lyrify-fs-exit-btn,
    .lyrify-fs-exit-btn:hover {
      opacity: 1 !important;
      pointer-events: auto;
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
    }
    .lyrify-setting-row label {
      min-width: 120px;
      opacity: 0.85;
    }
    .lyrify-setting-row input[type="range"] {
      flex: 1;
      min-width: 120px;
      max-width: 220px;
    }
    .lyrify-setting-val {
      width: 40px;
      text-align: right;
      opacity: 0.75;
      font-variant-numeric: tabular-nums;
    }
    .lyrify-setting-row input[type="checkbox"] {
      transform: translateY(1px);
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
