#!/usr/bin/env bash
# Image Asset Format & Guardrail Validator
# Ensures only .webp and .svg are committed into content directories.

set -euo pipefail

echo "==> Validating image assets in images/..."

INVALID_FILES=0

# Scan images/home, images/about, images/events, images/team, images/gallery for non-webp/svg files
while IFS= read -r file; do
  case "$file" in
    *.gitkeep|*.md)
      ;;
    *.webp|*.svg)
      ;;
    images/shared/favicon.ico|images/shared/favicon.png|images/shared/logo.png)
      # Allowed legacy fallbacks for favicon and logo in shared/
      ;;
    *)
      echo "❌ VIOLATION: $file is not a modern .webp or .svg image!"
      INVALID_FILES=$((INVALID_FILES + 1))
      ;;
  esac
done < <(find images -type f)

if [ "$INVALID_FILES" -gt 0 ]; then
  echo "❌ Error: $INVALID_FILES image(s) violated format guidelines. Please convert all raster photos to .webp."
  exit 1
fi

echo "✅ All image assets passed format validation."
