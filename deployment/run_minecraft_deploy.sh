#!/usr/bin/env bash
set -euo pipefail

# QNAP cron provides a minimal environment, so establish the paths this
# wrapper needs explicitly.
export HOME="/share/homes/msaperst"
export PATH="/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/share/CACHEDEV1_DATA/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SCRIPT="$HOME/minecraft_scripts/deploy_minecraft.sh"
LOG_DIR="$HOME/minecraft_logs"
STATE_DIR="$HOME/minecraft_deployment"
REPO_URL="https://github.com/msaperst/porter-minecraft-dev.git"

mkdir -p "$LOG_DIR" "$STATE_DIR"

# Do the cheap GitHub comparison here before creating a log. Cron can run this
# every minute without generating 1,440 no-op log files every day.
REMOTE_SHA="$(git ls-remote "$REPO_URL" refs/heads/main | awk '{print $1}')"

if [[ -z "$REMOTE_SHA" ]]; then
  exit 1
fi

DEPLOYED_SHA=""
if [[ -f "$STATE_DIR/deployed_main_sha" ]]; then
  DEPLOYED_SHA="$(cat "$STATE_DIR/deployed_main_sha")"
fi

if [[ "$REMOTE_SHA" == "$DEPLOYED_SHA" ]]; then
  exit 0
fi

# A new commit needs a real deployment attempt, so start a timestamped log.
STAMP="$(date +%F_%H-%M-%S)"
LOG_FILE="$LOG_DIR/deploy_$STAMP.log"

{
  echo "===================================="
  echo "Minecraft deployment: $STAMP"
  echo "Target commit: $REMOTE_SHA"
  echo "===================================="
} | tee -a "$LOG_FILE"

# Capture both stdout and stderr from the deployment script in the run log.
if "$SCRIPT" 2>&1 | tee -a "$LOG_FILE"; then
  echo "[OK] Deployment finished: $(date)" | tee -a "$LOG_FILE"
else
  STATUS=$?
  echo "[ERROR] Deployment failed with status $STATUS: $(date)" | tee -a "$LOG_FILE"
  exit "$STATUS"
fi

# Keep deployment history useful without letting logs accumulate forever.
find "$LOG_DIR" -type f -name 'deploy_*.log' -mtime +90 -delete
