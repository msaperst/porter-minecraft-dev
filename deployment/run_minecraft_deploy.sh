#!/usr/bin/env bash
set -euo pipefail
export HOME="/share/homes/msaperst"
export PATH="/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/share/CACHEDEV1_DATA/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
SCRIPT="$HOME/minecraft_scripts/deploy_minecraft.sh"
LOG_DIR="$HOME/minecraft_logs"
STATE_DIR="$HOME/minecraft_deployment"
mkdir -p "$LOG_DIR" "$STATE_DIR"
REPO_URL="https://github.com/msaperst/porter-minecraft-dev.git"
REMOTE_SHA="$(git ls-remote "$REPO_URL" refs/heads/main | awk '{print $1}')"
DEPLOYED_SHA=""
[[ -f "$STATE_DIR/deployed_main_sha" ]] && DEPLOYED_SHA="$(cat "$STATE_DIR/deployed_main_sha")"
[[ -n "$REMOTE_SHA" ]] || exit 1
[[ "$REMOTE_SHA" == "$DEPLOYED_SHA" ]] && exit 0
STAMP="$(date +%F_%H-%M-%S)"
LOG_FILE="$LOG_DIR/deploy_$STAMP.log"
echo "====================================" | tee -a "$LOG_FILE"
echo "Minecraft deployment: $STAMP" | tee -a "$LOG_FILE"
echo "Target commit: $REMOTE_SHA" | tee -a "$LOG_FILE"
echo "====================================" | tee -a "$LOG_FILE"
if "$SCRIPT" 2>&1 | tee -a "$LOG_FILE"; then
  echo "[OK] Deployment finished: $(date)" | tee -a "$LOG_FILE"
else
  STATUS=$?
  echo "[ERROR] Deployment failed with status $STATUS: $(date)" | tee -a "$LOG_FILE"
  exit "$STATUS"
fi
find "$LOG_DIR" -type f -name 'deploy_*.log' -mtime +90 -delete
