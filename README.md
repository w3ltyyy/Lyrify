# 🎵 Spotytext

Spotytext is a powerful lyrics synchronization extension for **Spotify** (via **Spicetify**). It allows users to view high-quality synced lyrics and contributes to an open database of synchronized timecodes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## ✨ Features

- **Real-time Sync**: Smoothly scrolling lyrics that follow your music perfectly.
- **Recording Mode**: A minimalist, high-performance "Recording HUD" to manually capture timecodes for any song.
- **Open Contribution**: Submit your synchronized lyrics to a central API for moderation and public use.
- **Minimalist Design**: Non-intrusive UI that blends seamlessly with the Spotify aesthetic.
- **Persistent Cache**: Fast loading times with local caching for previously viewed lyrics.

---

## 🛠️ Components

The project consists of two main parts:

1.  **Spicetify Extension**: The frontend client injected into Spotify.
2.  **Node.js Backend**: An API built with SQLite to store and serve synchronized lyrics.

---

## 🚀 Getting Started

### 1. Backend Setup

The backend stores the synchronized lyrics in a local SQLite database.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
    *The API will be available at `http://localhost:8080`.*

### 2. Spicetify Extension Installation

1.  Ensure you have **Spicetify-cli** installed ([Docs](https://spicetify.app/docs/getting-started)).
2.  Navigate to the extension directory:
    ```bash
    cd spicetify-lyrics-sync
    ```
3.  Build and install the extension:
    ```bash
    ./scripts/build-and-install-spicetify-extension.sh
    ```
4.  Apply the changes to Spotify:
    ```bash
    spicetify apply
    ```

---

## 🎧 Usage: Recording Mode

To synchronize a song that doesn't have timecodes yet:

1.  Open the Spotytext lyrics view.
2.  Enable **Recording Mode** (HUD appears at the top).
3.  Press **`[Enter]`** to capture the start time for the current line as it plays.
4.  Once all lines are synced, click **Commit** (or the checkmark) to submit your masterpiece to the database.

---

## 📂 Project Structure

```bash
.
├── backend/                  # Node.js API + SQLite Database
│   ├── data/                 # Database storage
│   ├── server.js             # API Logic
│   └── migrate.js            # Database migration tools
└── spicetify-lyrics-sync/    # Extension source code
    ├── src/                  # TypeScript source files
    └── scripts/              # Build & Installation scripts
```

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or bug fixes, feel free to open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
