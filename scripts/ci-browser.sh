#!/bin/sh
# GitHub's Ubuntu image already includes Chrome. Avoid starting a second,
# snap-backed browser installation when a working Chromium-family browser exists.
set -eu

find_browser() {
  for name in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$name" >/dev/null 2>&1; then
      candidate=$(command -v "$name")
      if "$candidate" --version >/dev/null 2>&1; then
        printf '%s\n' "$candidate"
        return 0
      fi
    fi
  done
  return 1
}

if ! browser=$(find_browser); then
  sudo apt-get update
  sudo apt-get install -y chromium-browser || sudo apt-get install -y chromium
  browser=$(find_browser)
fi

"$browser" --version
printf 'CHROMIUM_BIN=%s\n' "$browser" >> "${GITHUB_ENV:?GitHub environment file is required}"
