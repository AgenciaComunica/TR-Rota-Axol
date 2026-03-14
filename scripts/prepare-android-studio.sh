#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WINDOWS_PROJECT_DIR="${TR_ROTA_WINDOWS_DIR:-/mnt/c/dev/TR-Rota-Axol}"

echo "==> Build web"
cd "$ROOT_DIR"
npm run build

echo "==> Sync Capacitor Android"
npx cap sync android

echo "==> Mirror project to Windows"
mkdir -p "$WINDOWS_PROJECT_DIR"
rsync -a --delete --human-readable --info=stats1 \
  --exclude ".git" \
  --exclude ".idea" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude "android/.gradle" \
  --exclude "android/build" \
  --exclude "android/app/build" \
  --exclude "android/local.properties" \
  "$ROOT_DIR/" "$WINDOWS_PROJECT_DIR/"

echo "==> Done"
echo "Android Studio project: $WINDOWS_PROJECT_DIR/android"
