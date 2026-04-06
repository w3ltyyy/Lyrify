export const SPOTIFY_SELECTORS = {
  lyricsContainer: [
    '[data-testid*="lyrics"]',
    '[data-testid*="lyrics-drawer"]',
    '[class*="lyrics-lyricsContainer"]',
    '[class*="LyricsScrollContainer"]',
    '[class*="nowPlayingLyrics"]',
    '.main-nowPlayingView-section > div[class*="lyrics"]',
    'div[role="region"][aria-label*="Lyrics" i]',
    'div[aria-label*="Lyrics" i]',
    'aside[aria-label*="Lyrics" i]'
  ],
  lyricsLine: [
    '[data-testid*="lyrics-line"]',
    '[data-testid*="lyrics-line-text"]',
    '[class*="lyrics-line"]',
    '[class*="LyricsLine"]',
    '[class*="lyricsLine"]'
  ],
  lyricsButton: [
    '[data-testid*="lyrics-button"]',
    '[data-testid*="control-button-lyrics"]',
    'button[aria-label*="Lyrics" i]',
    'button[aria-label*="Текст" i]'
  ],
  mainView: [
    '[data-testid="main-view"]',
    '[data-testid="now-playing-view"]',
    '[data-testid="npv-main-view"]',
    '.Root__right-sidebar .main-view-container',
    '.main-nowPlayingView-nowPlayingView',
    '.Root__main-view',
    '.main-view-container',
    'main'
  ],
  nowPlayingBar: '[data-testid="now-playing-bar"], .Root__now-playing-bar'
};

export const METADATA_CANDIDATES = [
  "ps?.track?.metadata",
  "ps?.context_metadata",
  "ps?.page_metadata",
  "ps?.track",
  "ps?.item",
  "ps?.item?.metadata",
  "ps?.item?.album",
  "ps?.item?.artists?.[0]",
  "ps?.item?.artist",
  "queueTrack",
  "queueTrack?.metadata",
  "ps?.context_metadata?.metadata",
  "ps?.page_metadata?.metadata"
];

export const IMAGE_CANDIDATES = [
  "ps?.item?.album?.images?.[0]?.url",
  "ps?.item?.images?.[0]?.url",
  "ps?.track?.metadata?.image_xlarge_url",
  "ps?.track?.metadata?.image_large_url",
  "ps?.track?.metadata?.image_url",
  "ps?.page_metadata?.image_xlarge_url",
  "ps?.page_metadata?.image_large_url",
  "ps?.page_metadata?.image_url"
];
