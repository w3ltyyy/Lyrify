import { h } from "../domUtils";
import type { LyricLine } from "../syncModel";

export type LyricLineComponent = {
  element: HTMLElement;
  update: (isActive: boolean, isRecord: boolean) => void;
};

export function createLyricLine(
  line: LyricLine,
  index: number,
  onClick: (idx: number) => void
): LyricLineComponent {
  const element = h("div", {
    className: "lyrify-line",
    textContent: line.text,
    tabIndex: -1,
    dataset: { index: String(index) },
    onclick: (e: MouseEvent) => {
      (e.target as HTMLElement).blur();
      const ae = document.activeElement;
      if (ae instanceof HTMLElement) ae.blur();
      onClick(index);
    }
  });

  return {
    element,
    update: (isActive: boolean, isRecord: boolean) => {
      element.classList.toggle("s-active", isActive);
      element.classList.toggle("s-record", isRecord);
    }
  };
}
