#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="${ROOT_DIR}/spicetify-lyrics-sync"

EXT_NAME="lyrics-sync.js"
SRC_FILE="${EXT_DIR}/dist/${EXT_NAME}"

# Default Spicetify extensions directory for macOS/Linux.
# You can override by setting: SPOTYTEXT_SPICETIFY_EXTENSIONS_DIR
DEFAULT_EXTENSIONS_DIR="${HOME}/.config/spicetify/Extensions"
EXTENSIONS_DIR="${SPOTYTEXT_SPICETIFY_EXTENSIONS_DIR:-$DEFAULT_EXTENSIONS_DIR}"

APPLY_ON_COPY="${SPOTYTEXT_APPLY_ON_COPY:-0}"

echo "[spotytext] Building extension..."
if [ ! -d "${EXT_DIR}/node_modules" ]; then
  echo "[spotytext] node_modules not found; running npm install..."
  (cd "${EXT_DIR}" && npm install)
fi

(cd "${EXT_DIR}" && npm run build)

if [ ! -f "${SRC_FILE}" ]; then
  echo "[spotytext] Build output not found: ${SRC_FILE}" >&2
  exit 1
fi

mkdir -p "${EXTENSIONS_DIR}"
echo "[spotytext] Installing to: ${EXTENSIONS_DIR}/${EXT_NAME}"
cp -f "${SRC_FILE}" "${EXTENSIONS_DIR}/${EXT_NAME}"

if [ "${APPLY_ON_COPY}" = "1" ]; then
  if command -v spicetify >/dev/null 2>&1; then
    echo "[spotytext] Running spicetify apply..."
    spicetify apply
  else
    echo "[spotytext] spicetify not found in PATH; skipping spicetify apply"
  fi
fi

echo "[spotytext] Done."

