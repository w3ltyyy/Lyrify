import { h } from "../domUtils";
import { state } from "../state";
import { formatMs, debounceByAnimationFrame } from "../utils";

const SVG_PREV = `<svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L3.483 1.141a.7.7 0 0 0-1.083.593v12.532a.7.7 0 0 0 1.083.593L12 9.15V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/></svg>`;
const SVG_NEXT = `<svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l8.517-5.709a.7.7 0 0 1 1.083.593v12.532a.7.7 0 0 1-1.083.593L4 9.15V14.3a.7.7 0 0 1-.7.7H1.6a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7H3.3z"/></svg>`;
const SVG_PLAY = `<svg viewBox="0 0 16 16"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894a.7.7 0 0 1-1.05-.607V1.713z"/></svg>`;
const SVG_PAUSE = `<svg viewBox="0 0 16 16"><path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm7.4 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/></svg>`;
const SVG_CLOSE = `<svg viewBox="0 0 16 16"><path d="M14.354 1.646a.5.5 0 0 0-.708 0L8 7.293 2.354 1.646a.5.5 0 0 0-.708.708L7.293 8l-5.647 5.646a.5.5 0 0 0 .708.708L8 8.707l5.646 5.647a.5.5 0 0 0 .708-.708L8.707 8l5.647-5.646a.5.5 0 0 0 0-.708z"/></svg>`;
const SVG_HUD = `<svg viewBox="0 0 16 16"><path d="M1.5 2h13a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5zM0 2.5A1.5 1.5 0 0 1 1.5 1h13A1.5 1.5 0 0 1 16 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-11z"/><path d="M4 11h8V8H4v3z"/></svg>`;

export interface MiniPlayerOptions {
    onClose?: () => void;
}

export function createMiniPlayer(options: MiniPlayerOptions = {}) {
  const mini = h("div", { id: "spotytext-mini" });
  const header = h("div", { id: "spotytext-mini-header" });
  const title = h("span", {}, "Mini Player");
  const closeBtn = h("button", { id: "spotytext-mini-close", className: "spotytext-mini-header-btn", title: "Close" });
  closeBtn.innerHTML = SVG_CLOSE;
  closeBtn.onclick = (e) => {
      e.stopPropagation();
      options.onClose?.();
  };

  header.appendChild(title);
  header.appendChild(closeBtn);
  const body = h("div", { id: "spotytext-mini-body" });
  
  const info = h("div", { className: "spotytext-mini-info" }, "-");
  const scroll = h("div", { id: "spotytext-mini-scroll" });
  const seek = h("div", { id: "spotytext-mini-seek" });
  const actions = h("div", { id: "spotytext-mini-actions" });
  
  const miniSeekCurrent = h("div", { className: "spotytext-mini-time" }, "0:00");
  const miniSeekRange = h("input", { type: "range", min: "0", max: "1000", step: "1", value: "0" }) as HTMLInputElement;
  const miniSeekTotal = h("div", { className: "spotytext-mini-time" }, "0:00");
  
  seek.appendChild(miniSeekCurrent);
  seek.appendChild(miniSeekRange);
  seek.appendChild(miniSeekTotal);

  const miniPrev = h("button", { className: "spotytext-mini-icon-btn", title: "Previous" });
  const miniPlay = h("button", { className: "spotytext-mini-icon-btn s-play", title: "Play / Pause" });
  const miniNext = h("button", { className: "spotytext-mini-icon-btn", title: "Next" });
  
  miniPrev.innerHTML = SVG_PREV;
  miniPlay.innerHTML = SVG_PLAY;
  miniNext.innerHTML = SVG_NEXT;
  
  actions.appendChild(miniPrev);
  actions.appendChild(miniPlay);
  actions.appendChild(miniNext);

  let isAutoFollowEnabled = true;
  let ignoreProgrammaticScroll = false;
  
  const jumpNowBtn = h("button", { id: "spotytext-mini-jump" }, "Go to current line");
  jumpNowBtn.onclick = () => {
    isAutoFollowEnabled = true;
    const active = scroll.querySelector(".s-active") as HTMLElement;
    if (active) {
        ignoreProgrammaticScroll = true;
        active.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => { ignoreProgrammaticScroll = false; }, 1000);
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
    
    // Check if active line is visible to show/hide jump button
    const activeIdx = state.getActiveIndex();
    const activeNode = scroll.children[activeIdx] as HTMLElement;
    if (activeNode) {
        const rect = activeNode.getBoundingClientRect();
        const viewRect = scroll.getBoundingClientRect();
        const isVisible = rect.top >= (viewRect.top - 10) && rect.bottom <= (viewRect.bottom + 10);
        jumpNowBtn.style.display = isVisible || isAutoFollowEnabled ? "none" : "block";
    } else {
        jumpNowBtn.style.display = "none";
    }
  });

  // Drag logic
  let dragging = false;
  let startX = 0, startY = 0, originLeft = 0, originTop = 0;
  
  header.onpointerdown = (e: PointerEvent) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = mini.getBoundingClientRect();
    originLeft = rect.left;
    originTop = rect.top;
    
    const onMove = (me: PointerEvent) => {
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

  // Controls
  miniPrev.onclick = () => {
    (window as any).Spicetify.Player.back();
    isAutoFollowEnabled = true;
    setTimeout(() => renderFunc(), 100);
  };
  miniPlay.onclick = () => {
    (window as any).Spicetify.Player.togglePlay();
    setTimeout(() => renderFunc(), 100);
  };
  miniNext.onclick = () => {
    (window as any).Spicetify.Player.next();
    isAutoFollowEnabled = true;
    setTimeout(() => renderFunc(), 100);
  };

  miniSeekRange.oninput = () => {
      const dur = (window as any).Spicetify.Player.getDuration();
      const val = Number(miniSeekRange.value);
      miniSeekCurrent.textContent = formatMs(Math.floor((val / 1000) * dur));
  };
  miniSeekRange.onchange = () => {
      const dur = (window as any).Spicetify.Player.getDuration();
      const val = Number(miniSeekRange.value);
      (window as any).Spicetify.Player.seek(Math.floor((val / 1000) * dur));
  };

  let lastTrackKey: string | null = null;
  let lastActiveIdx = -1;

  const renderFunc = () => {
      const lyrics = state.getLyrics();
      const activeIdx = state.getActiveIndex();
      const progressMs = (window as any).Spicetify.Player.getProgress();
      const durationMs = (window as any).Spicetify.Player.getDuration();
      const isPlaying = (window as any).Spicetify.Player.isPlaying();

      const trackInfo = (window as any).Spicetify.Player.data?.track?.metadata || {};
      info.textContent = trackInfo.artist_name ? `${trackInfo.artist_name} — ${trackInfo.title}` : "-";
      
      miniSeekCurrent.textContent = formatMs(progressMs);
      miniSeekTotal.textContent = formatMs(durationMs);
      miniSeekRange.value = String(durationMs > 0 ? (progressMs / durationMs) * 1000 : 0);
      miniPlay.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;

      // Only rebuild if track changed or if we have new data for current track
      const needsRebuild = lyrics.trackKey !== lastTrackKey || (lyrics.lines.length > 0 && scroll.children.length === 0);

      if (needsRebuild && lyrics.lines.length > 0) {
          scroll.innerHTML = "";
          lyrics.lines.forEach((l: any, i: number) => {
            if (!l.text) return;
            const div = h("div", {
              className: "spotytext-mini-line",
              onclick: () => { 
                isAutoFollowEnabled = true;
                if (l.startTime !== null) (window as any).Spicetify.Player.seek(l.startTime); 
              }
            }, l.text);
            scroll.appendChild(div);
          });
          lastTrackKey = lyrics.trackKey;
          lastActiveIdx = -1;
          isAutoFollowEnabled = true; // Auto-attach on new track
      }

      // Update classes and scroll
      if (activeIdx !== lastActiveIdx || needsRebuild) {
          Array.from(scroll.children).forEach((el: any, i: number) => {
              el.classList.toggle("s-active", i === activeIdx);
              el.classList.toggle("s-prev", i === activeIdx - 1);
              el.classList.toggle("s-next", i === activeIdx + 1);
          });
          lastActiveIdx = activeIdx;
      }

      // Gravity logic: keep the active line centered
      if (isAutoFollowEnabled && activeIdx !== -1) {
          const activeNode = scroll.children[activeIdx] as HTMLElement;
          if (activeNode) {
              const rect = activeNode.getBoundingClientRect();
              const viewRect = scroll.getBoundingClientRect();
              
              const viewCenter = viewRect.top + viewRect.height / 2;
              const nodeCenter = rect.top + rect.height / 2;
              const isFarFromCenter = Math.abs(nodeCenter - viewCenter) > 25;

              if (isFarFromCenter || needsRebuild) {
                  ignoreProgrammaticScroll = true;
                  activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => { ignoreProgrammaticScroll = false; }, 600);
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
