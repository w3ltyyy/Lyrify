#!/bin/bash
# Script to build and push the Spicetify plugin dist to Git

set -e

echo "[lyrify] Building plugin..."
cd spicetify-lyrics-sync
npm run build
cd ..

echo "[lyrify] Staging build artifact..."
git add spicetify-lyrics-sync/dist/lyrics-sync.js -f

echo "[lyrify] Committing and pushing..."
git commit -m "build: update plugin distribution"
git push

echo "[lyrify] Done! Plugin build is now on Git."
