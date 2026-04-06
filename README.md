# 🎵 Lyrify

[English version below](#english) | [Русская версия](#russian)

---

<a name="russian"></a>
## 🇷🇺 Русская версия

**Lyrify** — это мощное расширение для синхронизации текста песен в **Spotify** (через **Spicetify**). Оно позволяет просматривать качественные синхронизированные тексты и вносить вклад в открытую базу данных таймкодов.

### ✨ Особенности

- **Синхронизация в реальном времени**: Плавная прокрутка текста, которая идеально следует за музыкой.
- **Режим записи (Recording HUD)**: Минималистичный и производительный интерфейс для ручного захвата таймкодов любой песни.
- **Открытый вклад**: Отправляйте свои синхронизированные тексты на модерацию в центральное API для общего использования.
- **Премиальный дизайн**: Современный интерфейс с эффектами размытия (Glassmorphism) и микро-анимациями, которые идеально вписываются в эстетику Spotify.
- **Умное кэширование**: Мгновенная загрузка ранее просмотренных текстов.

### 🛠️ Установка

#### 1. Настройка Бэкенда (API)
Бэкенд хранит синхронизированные тексты в локальной базе данных SQLite.

```bash
cd backend
npm install
node server.js
```

#### 2. Установка расширения Spicetify
1. Убедитесь, что у вас установлен **Spicetify-cli**.
2. Перейдите в папку расширения: `cd spicetify-lyrics-sync`.
3. Соберите и установите: `./scripts/build-and-install-spicetify-extension.sh`.
4. Примените изменения: `spicetify apply`.

### 🎧 Как пользоваться: Режим записи
Чтобы синхронизировать новую песню:
1. Нажмите на иконку **Lyrify** в плеере.
2. Включите **Recording Mode** (в настройках или через HUD).
3. Нажимайте **`[Space]`** или **`[Enter]`**, чтобы зафиксировать начало текущей строки под музыку.
4. После завершения нажмите **Submit**, чтобы отправить результат в базу.

---

<a name="english"></a>
## 🇺🇸 English Version

**Lyrify** is a professional lyrics synchronization extension for **Spotify** (via **Spicetify**). It provides high-quality synced lyrics and a robust infrastructure for contributing to an open database of timecodes.

### ✨ Features

- **Real-time Sync**: Smoothly scrolling lyrics with pixel-perfect tracking.
- **Recording HUD**: A minimalist, high-performance interface to manually capture timecodes for any song.
- **Contribution Workflow**: Submit your synchronized masterpiece to a central API for moderation and public use.
- **Modern Aesthetics**: Glassmorphism, blurred background blobs, and smooth transitions tailored for a premium Spotify experience.
- **Persistent Cache**: Fast loading times with intelligent local caching.

### 🚀 Getting Started

#### 1. Backend Setup
The backend serves synchronized lyrics from a local SQLite database.

```bash
cd backend
npm install
node server.js
```

#### 2. Spicetify Extension Installation
1. Ensure **Spicetify-cli** is installed.
2. Navigate to the extension directory: `cd spicetify-lyrics-sync`.
3. Build and install: `./scripts/build-and-install-spicetify-extension.sh`.
4. Apply changes: `spicetify apply`.

### 📂 Adding Media (Screenshots & Video)
To add your own media to this README:
1. Create a folder named `assets` in the root directory.
2. Place your photos (`view.png`, `hud.png`) or GIFs/videos there.
3. Reference them in Markdown: `![Description](assets/filename.png)`.

---

## 🤝 Contributing
Contributions are welcome! If you have ideas for new features or bug fixes, feel free to open a Pull Request on [GitHub](https://github.com/w3ltyyy/Lyrify).

## 📄 License
Licensed under the MIT License.
