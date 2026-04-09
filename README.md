<p align="center">
  <img src="assets/logo-v2.svg" width="200" height="200" />
</p>

<h1 align="center">Lyrify</h1>

<p align="center">
  <b>Professional Lyrics Sync for Spotify</b>
</p>

[Русская версия](README.ru.md)

---

**Lyrify** is a high-performance **Spotify** extension (via **Spicetify**) designed for audiophiles who value accuracy and aesthetics. It offers a complete ecosystem for viewing, recording, and moderating synchronized lyrics.

---

### ✨ Features at a Glance

- **Pixel-Perfect Sync**: Smoothly scrolling lyrics with sub-millisecond precision.
- **High-Performance Recording HUD**: A specialized interface for manual synchronization. Record timecodes using your keyboard in real-time.
- **Modern Aesthetics**:
  - Integrated **Glassmorphism** and dynamic background effects.
  - Fully responsive typography (font size, line spacing, max width).
  - Dynamic accent colors derived from track artwork.
- **Robust Architecture**:
  - **Backend**: Node.js API powered by **SQLite** with Write-Ahead Logging (WAL).
  - **Contribution**: Built-in submission system for community-driven lyrics updates.
- **Smart Fallbacks**: Automatically fetches from **LRCLIB**, **Spotify API**, or native DOM scraping.

---

### 📺 Video Demo

![Lyrify Demo](assets/demo.mp4)

---

### 🚀 Installation Guide

#### 1. Backend Service
The central hub for data storage and moderation.

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Start the service:
   ```bash
   node server.js
   ```
   *The API runs on port `8080` by default.*

#### 2. Extension Deployment
1. Ensure [Spicetify-cli](https://github.com/spicetify/cli) is configured.
2. Navigate to the extension folder: `cd spicetify-lyrics-sync`.
3. Run the automated deployment script:
   ```bash
   ./scripts/build-and-install-spicetify-extension.sh
   ```
4. Activate the extension:
   ```bash
   spicetify apply
   ```

---

### 🎧 Recording Mode (Sync Instruction)
To synchronize a song manually:
1. Open the **Lyrify** window and go to **Settings**.
2. Tab **Sync** -> Enable **Recording Mode**.
3. A **HUD** (Heads-Up Display) will appear at the top.
4. During playback, press **`[Space]`** or **`[Enter]`** at the start of each new line.
5. Press **`[V]`** or the check icon to submit the result to the server.

---

### ⚙️ Configuration & Customization
Lyrify allows deep customization through its settings panel:
- **General**: Text size (22px-52px), Background blur, Brightness.
- **Appearance**: Line spacing, Column width, Inactive line dimming.
- **Sync**: Auto-generation of timings, Recording Mode toggle.

---

### 📂 Adding Media (Screenshots & Video)
To add your own media to this README:
1. Create a folder named `assets` in the root directory.
2. Place your photos (`view.png`, `hud.png`) or GIFs/videos there.
3. Reference them in Markdown: `![Description](assets/filename.png)`.

---

### 📄 License
This project is licensed under the **MIT License**.
