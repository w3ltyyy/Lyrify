import type { LyricLine } from "./syncModel";

export type ManualSyncController = {
  isRecording: () => boolean;
  start: (initialIndex?: number) => void;
  stop: () => void;
  undo: () => void;
  setCurrentIndex: (index: number) => void;
  getCurrentIndex: () => number;
  updateLines: (newLines: LyricLine[]) => void;
  setLocked: (locked: boolean) => void;
  isLocked: () => boolean;
  recordAtCurrent: () => void;
};

export function createManualSyncController(options: {
  lines: LyricLine[];
  getProgressMs: () => number;
  setLineStartTime: (index: number, startTimeMs: number | null) => void;
  onIndexChange?: (newIndex: number) => void;
  onRecord?: (index: number, startTimeMs: number) => void;
  onStart?: () => void;
  onStop?: () => void;
}): ManualSyncController {
  let currentLines = options.lines;
  const { getProgressMs, setLineStartTime } = options;
  let recording = false;
  let locked = false;
  let currentIndex = 0;
  const history: { index: number; prevStartTime: number | null; stampedTime: number; prevCurrentIndex: number }[] = [];

  const nextIndex = (from: number) => {
    for (let i = from + 1; i < currentLines.length; i++) {
      if (currentLines[i]?.text?.trim()) return i;
    }
    return from; 
  };

  const recordAtCurrent = () => {
    if (!recording || locked) return;
    if (!currentLines[currentIndex]?.text?.trim()) {
      currentIndex = nextIndex(currentIndex);
    }

    const t = getProgressMs();
    const prev = currentLines[currentIndex]?.startTime;
    const prevStartTime = typeof prev === "number" ? prev : null;
    history.push({ index: currentIndex, prevStartTime, stampedTime: t, prevCurrentIndex: currentIndex });
    setLineStartTime(currentIndex, t);
    options.onRecord?.(currentIndex, t);
    currentIndex = nextIndex(currentIndex);
    options.onIndexChange?.(currentIndex);
  };

  const undoLast = () => {
    if (!recording || locked) return;
    const last = history.pop();
    if (!last) return;
    setLineStartTime(last.index, last.prevStartTime);
    currentIndex = last.index;
    options.onIndexChange?.(currentIndex);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!recording) return;
    const isEnter = e.code === "Enter" || e.key === "Enter";
    const isSpace = e.code === "Space" || e.key === " " || e.key === "Spacebar";
    const k = (e.key || "").toLowerCase();
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

    const isUndo = e.code === "Backspace" || e.key === "Backspace" || ((e.metaKey || e.ctrlKey) && (k === "z" || k === "я"));
    
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
    start: (initialIndex?: number) => {
      recording = true;
      history.splice(0, history.length);
      if (typeof initialIndex === "number" && Number.isFinite(initialIndex)) currentIndex = initialIndex;
      options.onIndexChange?.(currentIndex);
      options.onStart?.();
    },
    stop: () => {
      recording = false;
      options.onStop?.();
    },
    undo: () => {
      undoLast();
    },
    setCurrentIndex: (index: number) => {
      if (index < 0 || index >= currentLines.length) return;
      currentIndex = index;
      options.onIndexChange?.(currentIndex);
    },
    getCurrentIndex: () => currentIndex,
    updateLines: (newLines: LyricLine[]) => {
      currentLines = newLines;
      currentIndex = 0;
      history.splice(0, history.length);
      if (recording) options.onIndexChange?.(currentIndex);
    },
    setLocked: (l: boolean) => { locked = l; },
    isLocked: () => locked,
    recordAtCurrent: () => { recordAtCurrent(); }
  };
}
