#!/bin/bash
set -e
# Build
bun run build.js
# Copy dist to a temp location outside the repo
TMPDIR=$(mktemp -d)
cp -r dist/* "$TMPDIR/"
cp LICENSE "$TMPDIR/"
echo "[www.wechitracreativehouse.in](https://www.wechitracreativehouse.in)" > "$TMPDIR/CNAME"
CURRENT=$(git branch --show-current)
# Switch to main and wipe it
git checkout main
git rm -rf .
# Remove untracked leftovers (node_modules etc)
rm -rf node_modules .gitignore dist build.js deploy.sh bun.lock package.json src out tmp web
# Bring in the built files
rsync -a --delete --exclude='.git' "$TMPDIR/" .
rm -rf "$TMPDIR"
# Commit and force push with single orphan commit
git checkout --orphan temp
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
git branch -D main
git branch -m main
git push origin main --force
git checkout "$CURRENT"
echo "Deployed."
