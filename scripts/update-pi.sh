#!/bin/sh
# Brings the Pi up to date with master: pulls, and if anything changed,
# installs dependencies and builds. The screen reloads itself on a new build.
# Cron runs this every 8 hours; see README.md.
set -e

cd "$(dirname "$0")/.."
export PATH=/usr/bin:/usr/local/bin:$PATH

git fetch -q origin master
old=$(git rev-parse HEAD)
new=$(git rev-parse origin/master)
if [ "$old" = "$new" ]; then
	exit 0
fi

echo "$(date): updating $old -> $new"
git merge -q --ff-only origin/master
npm install --no-audit --no-fund
npm run build

# The service reads these only when it starts
if git diff --name-only "$old" "$new" | grep -qE '^(vite\.config\.ts|server/|package(-lock)?\.json)'; then
	sudo systemctl restart infoscreen
fi
