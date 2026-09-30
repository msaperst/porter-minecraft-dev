#!/usr/bin/env bash
set -euo pipefail
export HOME="/share/homes/msaperst"
export PATH="/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/share/CACHEDEV1_DATA/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
REPO_URL="https://github.com/msaperst/porter-minecraft-dev.git"
BRANCH="main"
VOLUME="minecraft-dev_minecraft-dev-data"
CONTAINER="minecraft-dev-minecraft-1"
PACK_DIR="/data/behavior_packs/porter-minecraft-dev"
STATE_DIR="$HOME/minecraft_deployment"
DEPLOYED_SHA_FILE="$STATE_DIR/deployed_main_sha"
LOCK_FILE="/tmp/minecraft_dev_deploy.lock"
STAGE_DIR="$STATE_DIR/staging"
mkdir -p "$STATE_DIR"
if [[ -f "$LOCK_FILE" ]]; then echo "[INFO] Another Minecraft deployment is already running. Exiting."; exit 0; fi
trap 'rm -f "$LOCK_FILE"; rm -rf "$STAGE_DIR"' EXIT
touch "$LOCK_FILE"
REMOTE_SHA="$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | awk '{print $1}')"
[[ -n "$REMOTE_SHA" ]] || { echo "[ERROR] Could not determine remote SHA for $BRANCH"; exit 1; }
DEPLOYED_SHA=""
[[ -f "$DEPLOYED_SHA_FILE" ]] && DEPLOYED_SHA="$(cat "$DEPLOYED_SHA_FILE")"
[[ "$REMOTE_SHA" == "$DEPLOYED_SHA" ]] && exit 0
echo "[INFO] New main commit detected: $REMOTE_SHA"
rm -rf "$STAGE_DIR"
git clone --quiet --depth 1 --branch "$BRANCH" "$REPO_URL" "$STAGE_DIR"
echo "[INFO] Validating staged add-on..."
python3 -m json.tool "$STAGE_DIR/manifest.json" >/dev/null
[[ -f "$STAGE_DIR/scripts/main.js" ]] || { echo "[ERROR] scripts/main.js is missing"; exit 1; }
STAGED_SHA="$(git -C "$STAGE_DIR" rev-parse HEAD)"
[[ "$STAGED_SHA" == "$REMOTE_SHA" ]] || { echo "[ERROR] Staged SHA does not match remote SHA"; exit 1; }
echo "[INFO] Deploying $STAGED_SHA..."
docker run --rm -v "$VOLUME:/data" -v "$STAGE_DIR:/staging:ro" alpine sh -c "set -e; rm -rf '$PACK_DIR.new'; mkdir -p '$PACK_DIR.new'; cp -a /staging/. '$PACK_DIR.new/'; rm -rf '$PACK_DIR.previous'; if [ -d '$PACK_DIR' ]; then mv '$PACK_DIR' '$PACK_DIR.previous'; fi; mv '$PACK_DIR.new' '$PACK_DIR'"
echo "[INFO] Restarting Minecraft..."
docker restart "$CONTAINER" >/dev/null
sleep 8
docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER" || { echo "[ERROR] Minecraft container is not running after deployment"; exit 1; }
LOGS="$(docker logs --since 30s "$CONTAINER" 2>&1)"
printf '%s\n' "$LOGS" | grep -q "Server started" || { echo "[ERROR] Minecraft did not report a successful startup"; exit 1; }
printf '%s\n' "$LOGS" | grep -q "My First Minecraft Mod" || { echo "[ERROR] Porter behavior pack was not reported in startup logs"; exit 1; }
printf '%s\n' "$STAGED_SHA" > "$DEPLOYED_SHA_FILE"
echo "[OK] Deployed $STAGED_SHA successfully"
