export const CSS_ID = "spotytext-lyrics-sync-styles";

export const STYLES = `
    #spotytext-host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 30;
    }
    #spotytext-overlay {
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
      background: var(--spotytext-bg, #121212);
    }
    #spotytext-vibrant-bg {
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
    #spotytext-overlay.s-vibrant-enabled {
      background: #000;
    }
    #spotytext-overlay.s-vibrant-enabled #spotytext-vibrant-bg {
      display: block;
      opacity: 0.65;
    }
    #spotytext-overlay.s-vibrant-enabled #spotytext-card {
      background: rgba(18,18,18, 0.65);
      backdrop-filter: blur(48px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .spotytext-blob {
      position: absolute;
      width: min(100vh, 800px);
      height: min(100vh, 800px);
      border-radius: 50%;
      opacity: 0.65;
      filter: blur(110px);
      will-change: transform, background;
      transition: background 2s ease;
    }
    .spotytext-blob-0 { background: var(--spotytext-color-1, #1db954); top: -10%; left: -10%; animation: spoty-drift-1 25s infinite alternate ease-in-out; }
    .spotytext-blob-1 { background: var(--spotytext-color-2, #18ac4b); top: -10%; right: -10%; animation: spoty-drift-2 30s infinite alternate ease-in-out; }
    .spotytext-blob-2 { background: var(--spotytext-color-3, #159341); bottom: -10%; left: -10%; animation: spoty-drift-3 28s infinite alternate ease-in-out; }
    .spotytext-blob-3 { background: var(--spotytext-color-4, #12823a); bottom: -10%; right: -10%; animation: spoty-drift-4 32s infinite alternate ease-in-out; }

    @keyframes spoty-drift-1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(25%, 20%) scale(1.1); }
    }
    @keyframes spoty-drift-2 {
      0% { transform: translate(0, 0) scale(1.1); }
      100% { transform: translate(-20%, 25%) scale(1); }
    }
    @keyframes spoty-drift-3 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(20%, -25%) scale(1.15); }
    }
    @keyframes spoty-drift-4 {
      0% { transform: translate(0, 0) scale(1.1); }
      100% { transform: translate(-25%, -20%) scale(1); }
    }
    #spotytext-card {
      width: min(860px, 88vw);
      max-height: 82vh;
      min-height: 480px;
      align-self: stretch;
      display: flex;
      flex-direction: column;
      background: var(--spotytext-card-bg, #121212);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 26px 90px rgba(0,0,0,0.75);
      filter: brightness(var(--spotytext-brightness, 1));
    }
    #spotytext-overlay.s-fullscreen #spotytext-card {
      width: 100%;
      height: 100%;
      max-height: none;
      border-radius: 0;
      border: none;
      box-shadow: none;
    }
    #spotytext-mini {
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
    #spotytext-mini.s-open {
      display: block;
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    #spotytext-mini.s-open {
      display: block;
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    
    #spotytext-mini-header {
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
    #spotytext-mini-body {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: calc(100% - 46px);
      box-sizing: border-box;
    }
    .spotytext-mini-info {
        text-align: center;
        font-size: 11.5px;
        font-weight: 600;
        opacity: 0.75;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    #spotytext-mini-line {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #spotytext-mini-scroll {
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
    .spotytext-mini-line {
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
    .spotytext-mini-line.s-active {
      opacity: 1;
      transform: scale(1.08);
      background: var(--spotytext-line-active-bg, rgba(30, 215, 96, 0.22));
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.15);
      font-size: 26px;
      font-weight: 800;
      color: #fff;
    }
    .spotytext-mini-line.s-prev,
    .spotytext-mini-line.s-next {
      opacity: 0.45;
    }
    #spotytext-mini-scroll.s-enter-up .spotytext-mini-line {
      opacity: 0;
      transform: translateY(16px) scale(0.96);
    }
    #spotytext-mini-scroll.s-enter-down .spotytext-mini-line {
      opacity: 0;
      transform: translateY(-16px) scale(0.96);
    }
    #spotytext-mini-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }
    #spotytext-mini-seek {
      display: grid;
      grid-template-columns: 42px 1fr 42px;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
    }
    #spotytext-mini-seek input[type="range"] {
      width: 100%;
      appearance: none;
      -webkit-appearance: none;
      height: 14px;
      background: transparent;
      cursor: pointer;
    }
    #spotytext-mini-seek input[type="range"]::-webkit-slider-runnable-track {
      height: 3px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--spotytext-accent-strong, #1db954) 48%, #ffffff 12%);
      opacity: 0.9;
    }
    #spotytext-mini-seek input[type="range"]::-webkit-slider-thumb {
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
    #spotytext-mini-seek input[type="range"]::-moz-range-track {
      height: 3px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--spotytext-accent-strong, #1db954) 48%, #ffffff 12%);
      opacity: 0.9;
    }
    #spotytext-mini-seek input[type="range"]::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.22);
    }
    .spotytext-mini-time {
      font-size: 11px;
      opacity: 0.82;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
    #spotytext-mini-jump {
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
    #spotytext-mini-jump:hover {
        transform: scale(1.05);
        background: #f0f0f0;
    }
    .spotytext-mini-icon-btn {
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
    .spotytext-mini-icon-btn:hover {
      transform: translateY(-2px) scale(1.1);
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .spotytext-mini-icon-btn:active {
        transform: scale(0.94);
    }
    .spotytext-mini-icon-btn svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
    }
    .spotytext-mini-icon-btn.s-play {
        width: 52px;
        height: 52px;
        background: #fff;
        color: #000;
        border: none;
    }
    .spotytext-mini-icon-btn.s-play:hover {
        background: #f0f0f0;
        transform: translateY(-2px) scale(1.08);
    }
    .spotytext-mini-icon-btn.s-play svg {
        width: 24px;
        height: 24px;
    }
    @keyframes spotytextMiniPulse {
      0% { box-shadow: inset 0 0 0 rgba(255,255,255,0); }
      50% { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); }
      100% { box-shadow: inset 0 0 0 rgba(255,255,255,0); }
    }
    .spotytext-mini-header-btn {
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
    .spotytext-mini-header-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      transform: scale(1.05);
    }
    .spotytext-mini-header-btn.s-active {
        color: var(--spotytext-accent-strong, #1db954);
    }
    .spotytext-mini-header-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    #spotytext-header {
      flex-shrink: 0;
      padding: 14px 16px 12px;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    #spotytext-header-right {
      display: inline-flex;
      gap: 10px;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 auto;
    }
    #spotytext-title {
      font-weight: 700;
      font-size: 12.5px;
      line-height: 1.2;
      opacity: 0.95;
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #spotytext-settings-toggle {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 14px;
      line-height: 1;
    }
    #spotytext-mini-toggle {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 12px;
      line-height: 1;
    }
    #spotytext-mini-toggle.s-active {
      background: var(--spotytext-accent-soft, rgba(30,215,96,0.16));
      border-color: var(--spotytext-accent-border, rgba(30,215,96,0.55));
      color: var(--spotytext-accent-text, #d8ffe7);
    }
    #spotytext-close {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 7px 10px;
      font-size: 12px;
    }
    #spotytext-body {
      padding: 12px 16px 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      position: relative;
    }
    #spotytext-settings-panel {
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
    #spotytext-settings-panel.s-open {
      display: flex;
    }
    #spotytext-settings-title {
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
    #spotytext-settings-close {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 6px 9px;
      font-size: 12px;
      line-height: 1;
    }
    #spotytext-settings-section {
      padding: 2px 4px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #spotytext-settings-nav {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 0 2px 2px;
      scrollbar-width: thin;
    }
    .spotytext-settings-cat-btn {
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
    .spotytext-settings-cat-btn.is-active {
      background: var(--spotytext-accent-soft, rgba(30, 215, 96, 0.16));
      border-color: var(--spotytext-accent-border, rgba(30, 215, 96, 0.55));
      color: var(--spotytext-accent-text, #d8ffe7);
    }
    #spotytext-settings-content {
      overflow-y: auto;
      min-height: 0;
      padding-right: 2px;
    }
    .spotytext-settings-category {
      padding-top: 2px;
      margin-top: 2px;
      border-top: 1px dashed rgba(255,255,255,0.08);
    }
    .spotytext-settings-subtitle {
      margin-top: 4px;
      font-size: 11.5px;
      font-weight: 700;
      opacity: 0.85;
      letter-spacing: 0.01em;
    }
    .spotytext-setting-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .spotytext-setting-row label {
      min-width: 120px;
      opacity: 0.85;
    }
    .spotytext-setting-row input[type="range"] {
      flex: 1;
      min-width: 120px;
      max-width: 220px;
    }
    .spotytext-setting-val {
      width: 40px;
      text-align: right;
      opacity: 0.75;
      font-variant-numeric: tabular-nums;
    }
    .spotytext-setting-row input[type="checkbox"] {
      transform: translateY(1px);
    }
    #spotytext-scroll-wrap {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin-top: 4px;
    }
    #spotytext-scroll-wrap.s-fade-disabled #spotytext-scroll-inner {
      mask-image: none !important;
      -webkit-mask-image: none !important;
    }
    #spotytext-scroll-inner {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 4px 24px;
      scrollbar-gutter: stable;
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
      transition: mask-image 0.2s ease, -webkit-mask-image 0.2s ease;
    }
    #spotytext-scroll-inner.s-no-mask-top {
      mask-image: linear-gradient(to bottom, black 0%, black 85%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 0%, black 85%, transparent 100%);
    }
    #spotytext-scroll-inner.s-no-mask-bottom {
      mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 100%);
    }
    #spotytext-scroll-inner.s-no-mask-top.s-no-mask-bottom {
      mask-image: none;
      -webkit-mask-image: none;
    }
    #spotytext-lines {
      display: flex;
      flex-direction: column;
      gap: var(--spotytext-lines-gap, 14px);
      margin: 4px auto 0;
      max-width: min(var(--spotytext-lines-max-width, 720px), 100%);
    }
    .spotytext-line {
      font-size: var(--spotytext-line-font-size, 35px);
      font-weight: 700;
      line-height: 1.12;
      letter-spacing: -0.01em;
      padding: 4px 4px;
      border-radius: 10px;
      opacity: var(--spotytext-line-dim-opacity, 0.38);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      transform: translateY(5px) scale(0.985);
      transition: opacity 220ms ease, transform 260ms ease, background-color 260ms ease, text-decoration 220ms ease;
    }
    #spotytext-lines.s-unsynced .spotytext-line {
      opacity: 0.95;
      transform: translateY(0) scale(1);
      cursor: default;
    }
    #spotytext-lines.s-synced .spotytext-line:hover {
      opacity: 0.85;
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
      text-decoration-color: var(--spotytext-accent-soft, rgba(30,215,96,0.5));
    }
    #spotytext-lines.s-synced .spotytext-line.s-active:hover {
      opacity: 1;
    }
    .spotytext-line.s-active {
      opacity: 1;
      transform: translateY(0) scale(1.015);
      background: var(--spotytext-line-active-bg, rgba(255,255,255,0.08));
    }
    .spotytext-line.s-record {
      opacity: 1;
      background: rgba(255,255,255,0.08);
    }
    .spotytext-btn {
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.92);
      padding: 8px 10px;
      font-size: 12px;
      transition: all 0.2s ease;
    }
    .spotytext-btn:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-1px);
    }
    .spotytext-btn-clear {
      background: rgba(255, 100, 100, 0.1);
      border-color: rgba(255, 100, 100, 0.25);
      color: #ff8e8e;
      margin-top: 10px;
      width: 100%;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .spotytext-btn-clear:hover {
      background: rgba(255, 100, 100, 0.2);
      border-color: rgba(255, 100, 100, 0.4);
    }
    .spoty-puff-anim {
      animation: spoty-puff 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes spoty-puff {
      0% { transform: scale(1); filter: brightness(1) blur(0); }
      30% { transform: scale(1.05); filter: brightness(2) blur(2px); }
      100% { transform: scale(1); filter: brightness(1) blur(0); }
    }
    .spoty-wave-clear {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
      pointer-events: none;
      z-index: 100;
      opacity: 0;
    }
    .spoty-wave-active {
      animation: spoty-wave 0.8s ease-out forwards;
    }
    @keyframes spoty-wave {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
    .spotytext-btn[disabled] {
      opacity: 0.55;
      cursor: default;
    }
    #spotytext-meta {
      font-size: 11.5px;
      opacity: 0.72;
      margin-bottom: 8px;
      white-space: pre-wrap;
    }
    #spotytext-jump-now {
      position: sticky;
      bottom: 10px;
      margin-left: auto;
      margin-top: 12px;
      z-index: 5;
      border-radius: 999px;
      background: var(--spotytext-accent-soft, rgba(30, 215, 96, 0.16));
      border: 1px solid var(--spotytext-accent-border, rgba(30, 215, 96, 0.55));
      color: var(--spotytext-accent-text, #d8ffe7);
      backdrop-filter: blur(3px);
    }
    #spotytext-inline-trigger {
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
    #spotytext-inline-trigger:hover {
      color: #ffffff;
      opacity: 1;
    }
    #spotytext-inline-trigger.s-active {
      color: var(--spotytext-accent-strong, rgba(30,215,96,1));
      opacity: 1;
    }
    #spotytext-inline-trigger svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: currentColor;
    }
    #spotytext-record-hud {
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
    #spotytext-record-hud.s-open {
      display: block;
    }
    #spotytext-record-hud-header {
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
    #spotytext-record-hud-track {
      font-size: 10px;
      opacity: 0.45;
      padding: 8px 14px 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #spotytext-record-hud-status {
      font-size: 9px;
      font-weight: 700;
      padding: 0 14px 8px;
      text-transform: uppercase;
      opacity: 0.8;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    #spotytext-record-hud-body {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #spotytext-record-hud-line {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      min-height: 42px;
      display: flex;
      align-items: center;
    }
    #spotytext-record-hud-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    #spotytext-record-hud-counter {
      font-size: 10px;
      opacity: 0.35;
      margin-left: auto;
      font-variant-numeric: tabular-nums;
    }
    #spotytext-record-hud-toast {
      position: absolute;
      bottom: 12px;
      left: 14px;
      font-size: 9px;
      font-weight: 800;
      color: var(--spotytext-accent-strong, #1db954);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #spotytext-record-hud-toast.s-show {
      opacity: 1;
    }
    #spotytext-record-hud-hint {
      font-size: 9px;
      opacity: 0.25;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    #spotytext-record-hud-list {
      max-height: 80px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;
    }
    .spotytext-record-hud-item {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 9.5px;
      padding: 4px 6px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .spotytext-record-hud-item:hover {
      background: rgba(255,255,255,0.06);
    }
    .spotytext-mini-header-btn {
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
    .spotytext-mini-header-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .spotytext-mini-header-btn svg {
      width: 14px;
      height: 14px;
    }
    .spotytext-record-hud-item-time {
      color: var(--spotytext-accent-strong, #1db954);
      font-weight: 700;
    }
    #spotytext-record-hud-toast {
      position: absolute;
      bottom: 12px;
      left: 14px;
      font-size: 9px;
      font-weight: 800;
      color: var(--spotytext-accent-strong, #1db954);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #spotytext-record-hud-toast.s-show {
      opacity: 1;
    }
`;
