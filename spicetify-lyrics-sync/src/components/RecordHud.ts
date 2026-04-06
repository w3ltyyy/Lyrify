import { h, hSvg } from "../domUtils";
import { state } from "../state";
import { formatMs } from "../utils";
import { ManualSyncController } from "../manualSync";

export function createRecordHud(manual: ManualSyncController, onSubmit?: () => void, onClose?: () => void) {
  const hud = h("div", { id: "spotytext-record-hud" });
  
  // Header (Compact)
  const header = h("div", { id: "spotytext-record-hud-header" }, "Sync Mode");
  const closeBtn = h("button", { className: "spotytext-mini-header-btn", title: "Hide" }, [
      hSvg("svg", { viewBox: "0 0 24 24", fill: "none" }, [
          hSvg("path", { d: "M18 6L6 18M6 6l12 12", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", fill: "none" })
      ])
  ]);
  header.appendChild(closeBtn);

  // Info
  const trackNameEl = h("div", { id: "spotytext-record-hud-track" }, "Loading...");
  const statusEl = h("div", { id: "spotytext-record-hud-status" });

  const body = h("div", { id: "spotytext-record-hud-body" });
  
  // Single Focus Line
  const lineCurrent = h("div", { id: "spotytext-record-hud-line" }, "...");

  // Control Row
  const actions = h("div", { id: "spotytext-record-hud-actions" });
  const undoBtn = h("button", { className: "spotytext-btn", style: { padding: "4px 10px" }, title: "Undo (Backspace)" }, "Undo");
  const submitBtn = h("button", { className: "spotytext-btn", style: { padding: "4px 10px", fontWeight: "700", borderColor: "var(--spotytext-accent-strong)" }, title: "Submit for review" }, "Submit");
  const counter = h("div", { id: "spotytext-record-hud-counter" }, "0 / 0");

  actions.appendChild(undoBtn);
  actions.appendChild(submitBtn);
  actions.appendChild(counter);

  const hint = h("div", { id: "spotytext-record-hud-hint" }, "Enter/Space to capture");
  const toast = h("div", { id: "spotytext-record-hud-toast" }, "Saved");
  const list = h("div", { id: "spotytext-record-hud-list" });

  body.appendChild(lineCurrent);
  body.appendChild(actions);
  body.appendChild(hint);
  body.appendChild(toast);
  body.appendChild(list);

  hud.appendChild(header);
  hud.appendChild(trackNameEl);
  hud.appendChild(statusEl);
  hud.appendChild(body);

  // Drag logic
  let dragging = false;
  let startX = 0, startY = 0, originLeft = 0, originTop = 0;
  header.onpointerdown = (e) => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = hud.getBoundingClientRect();
    originLeft = rect.left; originTop = rect.top;
    const onMove = (me: PointerEvent) => {
        if (!dragging) return;
        hud.style.left = `${originLeft + (me.clientX - startX)}px`;
        hud.style.top = `${originTop + (me.clientY - startY)}px`;
        hud.style.bottom = "auto";
    };
    const onUp = () => { dragging = false; window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
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

  const showToast = (msg: string) => {
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
          const btn = document.getElementById("spotytext-submit");
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

      // Update counter
      const total = lyrics.lines.length;
      const syncedCount = lyrics.lines.filter(l => l.startTime !== null).length;
      counter.textContent = `${syncedCount} / ${total}`;

      // Render mini list of last 3
      list.innerHTML = "";
      lyrics.lines
        .filter(l => l.startTime !== null)
        .slice(-3)
        .reverse()
        .forEach((l) => {
            const item = h("div", { 
                className: "spotytext-record-hud-item",
                onclick: () => (window as any).Spicetify.Player.seek(l.startTime)
            });
            item.appendChild(h("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", pointerEvents: "none" } }, l.text));
            item.appendChild(h("div", { className: "spotytext-record-hud-item-time", style: { pointerEvents: "none" } }, formatMs(l.startTime!)));
            list.appendChild(item);
        });
  };

  return {
    element: hud,
    toggle: () => hud.classList.toggle("s-open"),
    update: () => updateView(),
    updateTrack: (info: string, synced: boolean) => {
        trackNameEl.textContent = info;
        manual.setLocked(synced);
        
        [undoBtn, submitBtn].forEach(b => (b as HTMLButtonElement).disabled = synced);
        
        if (synced) {
            statusEl.textContent = "✓ Verified";
            statusEl.style.color = "#1db954";
        } else {
            statusEl.textContent = "⚠ Unsynchronized";
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
