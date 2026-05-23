#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-${GITHUB_SHA:-dev}}"

rm -rf dist
mkdir -p dist
cp index.html style.css app.js dist/

sed -i "s|href=\"style.css\"|href=\"style.css?v=${VERSION}\"|" dist/index.html
sed -i "s|src=\"app.js\"|src=\"app.js?v=${VERSION}\"|" dist/index.html

cat > dist/version.json <<JSON
{
  "version": "${VERSION}"
}
JSON
