# 🎵 Lyrify

[English version below](#english) | [Русская версия](#russian)

---

<a name="russian"></a>
# 🇷🇺 Lyrify: Синхронизация текста для Spotify

**Lyrify** — это профессиональное расширение для **Spotify** (через **Spicetify**), которое превращает прослушивание музыки в интерактивный опыт. Оно предоставляет не только качественные синхронизированные тексты, но и полноценную инфраструктуру для их создания и модерации.

---

### ✨ Ключевые возможности

- **Синхронизация в реальном времени**: Текст плавно прокручивается и подсвечивается в такт музыке.
- **Recording HUD (Режим записи)**: Уникальный интерфейс для создания таймкодов «на лету». Просто нажимайте клавишу при смене строки.
- **Премиальный дизайн**:
  - Эффект матового стекла (**Glassmorphism**).
  - Динамические живые фоны, подстраивающиеся под обложку альбома.
  - Гибкая настройка: размер шрифта, размытие, яркость и отступы.
- **Производительный бэкенд**: Сервер на **Node.js** с базой данных **SQLite (WAL mode)** для мгновенного отклика.
- **Умное кэширование**: Минимум сетевых запросов благодаря продвинутой системе хранения в браузере.

---

### 🚀 Быстрый старт

#### 1. Подготовка Бэкенда
Сервер хранит тексты и обрабатывает запросы от расширения.

1. Установите зависимости:
   ```bash
   cd backend
   npm install
   ```
2. Запустите сервер:
   ```bash
   node server.js
   ```
   *По умолчанию API доступно на `http://localhost:8080`.*

#### 2. Установка расширения Lyrify
1. Убедитесь, что у вас установлен [Spicetify-cli](https://github.com/spicetify/cli).
2. Перейдите в папку расширения: `cd spicetify-lyrics-sync`.
3. Запустите скрипт сборки:
   ```bash
   ./scripts/build-and-install-spicetify-extension.sh
   ```
4. Примените изменения в Spotify:
   ```bash
   spicetify apply
   ```

---

### 🎧 Инструкция по синхронизации (Recording Mode)
Если вы нашли песню без текста:
1. Откройте окно **Lyrify** и перейдите в **Settings** (Настройки).
2. Вкладка **Sync** -> Включите **Recording Mode**.
3. Наверху появится **HUD** (информационная панель).
4. Во время игры песни нажимайте **`[Space]`** или **`[Enter]`** в момент начала новой строки.
5. Нажмите **`[V]`** или иконку галочки, чтобы отправить текст на сервер.

---

### 📂 Добавление медиа
Чтобы добавить скриншоты в этот файл:
1. Создайте папку `assets` в корне проекта.
2. Поместите туда изображения (например, `main_view.png`, `settings.png`).
3. Добавьте их в Markdown: `![Settings](assets/settings.png)`.

---

<a name="english"></a>
# 🇺🇸 Lyrify: Professional Lyrics Sync for Spotify

**Lyrify** is a high-performance **Spotify** extension (via **Spicetify**) designed for audiophiles who value accuracy and aesthetics. it offers a complete ecosystem for viewing, recording, and moderating synchronized lyrics.

---

### ✨ Features at a Glance

- **Pixel-Perfect Sync**: Smoothly scrolling lyrics with sub-millisecond precision.
- **High-Performance Recording HUD**: A specialized interface for manual synchronization. Record timecodes using your keyboard in real-time.
- **State-of-the-Art Design**:
  - Integrated **Glassmorphism** and vibrant background effects.
  - Fully responsive typography (font size, line spacing, max width).
  - Dynamic accent colors derived from track artwork.
- **Robust Architecture**:
  - **Backend**: Node.js API powered by **SQLite** with Write-Ahead Logging (WAL).
  - **Contribution**: Built-in submission system for community-driven lyrics updates.
- **Smart Fallbacks**: Automatically fetches from **LRCLIB**, **Spotify API**, or native DOM scraping.

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

### ⚙️ Configuration & Customization
Lyrify allows deep customization through its settings panel:
- **General**: Text size (22px-52px), Background blur, Brightness.
- **Appearance**: Line spacing, Column width, Inactive line dimming.
- **Sync**: Auto-generation of timings, Recording Mode toggle.

### 📄 License
This project is licensed under the **MIT License**.
