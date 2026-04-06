export type TrackInfo = {
  artist: string;
  title: string;
  uri?: string;
  durationSeconds?: number;
  durationMs?: number;
  imageUrl?: string;
};

export function createPlayerObserver(onTrackChange: (newUri?: string) => void) {
  const w = window as any;

  const getTrackInfo = (): TrackInfo => {
    const ps = w.Spicetify?.Player?.data;
    const queue = w.Spicetify?.Queue ?? w.Spicetify?.Platform?.PlayerAPI?._queue;
    const queueTrack = queue?.item ?? queue?.queued?.[0] ?? queue?.nextTracks?.[0];

    // Different Spicetify versions expose metadata slightly differently.
    const mdCandidates = [
      ps?.track?.metadata,
      ps?.context_metadata,
      ps?.page_metadata,
      ps?.track,
      ps?.item,
      ps?.item?.metadata,
      ps?.item?.album,
      ps?.item?.artists?.[0],
      ps?.item?.artist,
      queueTrack,
      queueTrack?.metadata,
      ps?.context_metadata?.metadata,
      ps?.page_metadata?.metadata
    ];

    const safeText = (s: any) => (typeof s === "string" ? s.trim() : "");
    const firstNonEmptyString = (objects: any[], keys: string[]) => {
      for (const obj of objects) {
        if (!obj || typeof obj !== "object") continue;
        for (const k of keys) {
          const v = (obj as any)[k];
          const t = safeText(v);
          if (t) return t;
        }
      }
      return "";
    };

    const artistFromArray =
      safeText(ps?.item?.artists?.map((a: any) => safeText(a?.name)).filter(Boolean).join(", ")) ||
      safeText(queueTrack?.artists?.map((a: any) => safeText(a?.name)).filter(Boolean).join(", "));

    const artist =
      artistFromArray ||
      firstNonEmptyString(mdCandidates, ["artist_name", "album_artist_name", "artist", "artistName", "name"]);

    const title = firstNonEmptyString(mdCandidates, ["title", "name", "track_name", "trackName"]);

    const durationMsCandidates = [
      ps?.duration,
      ps?.item?.duration,
      ps?.item?.duration_ms,
      queueTrack?.duration,
      ps?.context_metadata?.duration,
      ps?.page_metadata?.duration,
      ps?.track?.metadata?.duration
    ];
    const durationMsRaw = durationMsCandidates.find((v) => v !== undefined && v !== null);
    const durationMs =
      typeof durationMsRaw === "number"
        ? durationMsRaw
        : typeof durationMsRaw === "string"
          ? Number(durationMsRaw)
          : Number(durationMsRaw ?? NaN);

    const durationSeconds = Number.isFinite(durationMs) && durationMs > 0 ? durationMs / 1000 : undefined;

    const imageCandidates = [
      ps?.item?.album?.images?.[0]?.url,
      ps?.item?.images?.[0]?.url,
      ps?.track?.metadata?.image_xlarge_url,
      ps?.track?.metadata?.image_large_url,
      ps?.track?.metadata?.image_url,
      ps?.page_metadata?.image_xlarge_url,
      ps?.page_metadata?.image_large_url,
      ps?.page_metadata?.image_url
    ];
    const rawImage = imageCandidates.find((v) => typeof v === "string" && v.length > 0) as string | undefined;
    const imageUrl = (() => {
      if (!rawImage) return undefined;
      if (rawImage.startsWith("spotify:image:")) {
        const id = rawImage.split(":")[2];
        if (id) return `https://i.scdn.co/image/${id}`;
      }
      if (rawImage.startsWith("https://") || rawImage.startsWith("http://")) return rawImage;
      return undefined;
    })();

    const uri = firstNonEmptyString(mdCandidates, ["uri", "track_uri"]);

    return {
      artist,
      title,
      uri: uri || ps?.item?.uri,
      durationSeconds,
      durationMs: Number.isFinite(durationMs) ? durationMs : undefined,
      imageUrl
    };
  };

  const isAdPlaying = (): boolean => {
    try {
      const ps = w.Spicetify?.Player?.data;
      const md = ps?.track?.metadata ?? ps?.item?.metadata ?? ps?.item ?? {};
      const uri = String(md?.uri ?? ps?.item?.uri ?? "").toLowerCase();
      const type = String(md?.media_type ?? md?.type ?? ps?.item?.type ?? "").toLowerCase();
      const explicitFlags = [
        ps?.item?.is_ad,
        ps?.item?.isAdvertisement,
        ps?.is_ad,
        md?.is_ad,
        md?.isAdvertisement
      ];
      if (explicitFlags.some(Boolean)) return true;
      if (uri.includes("spotify:ad:") || uri.includes("spotify:advertisement:")) return true;
      if (type === "ad" || type === "advertisement") return true;
    } catch {
      // ignore
    }
    return false;
  };

  const listener = (event?: any) => {
    onTrackChange(event?.data?.track?.uri);
  };

  w.Spicetify.Player.addEventListener("songchange", listener);

  return {
    getTrackInfo,
    isAdPlaying,
    destroy: () => {
      w.Spicetify.Player.removeEventListener("songchange", listener);
    }
  };
}
