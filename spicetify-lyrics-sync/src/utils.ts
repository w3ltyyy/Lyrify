export function debounceByAnimationFrame(fn: () => void) {
  let scheduled = false;
  return () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      try {
        fn();
      } catch {
        // ignore
      }
    });
  };
}

export interface ColorRGB { r: number; g: number; b: number }

export async function extractDominantColorFromImage(imageUrl: string): Promise<{ dominant: ColorRGB; palette: ColorRGB[] } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    const loaded = new Promise<void>((resolve, reject) => {
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

    // Extract palette by sampling corners and center
    const palette: ColorRGB[] = [];
    const samples = [
        { x: 4, y: 4 }, { x: size - 4, y: 4 }, 
        { x: 4, y: size - 4 }, { x: size - 4, y: size - 4 },
        { x: size / 2, y: size / 2 }
    ];

    samples.forEach(s => {
        const off = (Math.floor(s.y) * size + Math.floor(s.x)) * 4;
        if (data[off + 3] > 128) {
            palette.push({ r: data[off], g: data[off + 1], b: data[off + 2] });
        }
    });

    return { dominant, palette };
  } catch {
    return null;
  }
}

export function formatMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

const AUTHOR_ID_KEY = "lyrify_author_id";
export function getOrCreateAuthorId(): string {
    let id = localStorage.getItem(AUTHOR_ID_KEY);
    if (!id) {
        id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(AUTHOR_ID_KEY, id);
    }
    return id;
}

export function generateRandomNickname(): string {
    const adj = ["Shiny", "Golden", "Swift", "Quiet", "Bold", "Lively", "Wild", "Frosty", "Misty", "Vibrant", "Kind", "Cool", "Epic", "Magic", "Solar", "Lunar", "Super", "Elite", "Grand", "Cosmic"];
    const nouns = ["Panda", "Fox", "Eagle", "Wolf", "Tiger", "Bear", "Owl", "Deer", "Lynx", "Falcon", "Koala", "Otter", "Lion", "Shark", "Raven", "Dolphin", "Phoenix", "Leopard", "Cobra", "Dragon"];
    const a = adj[Math.floor(Math.random() * adj.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    return `${a} ${n}`;
}
