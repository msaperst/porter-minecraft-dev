#!/usr/bin/env bash
set -euo pipefail

# QNAP cron jobs run with a minimal environment. Set the home directory and
# PATH explicitly so Docker and our state directories resolve the same way
# whether this script is run manually or by cron.
export HOME="/share/homes/msaperst"
export PATH="/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/share/CACHEDEV1_DATA/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

# Source repository and branch that feed the development server.
REPO_URL="https://github.com/msaperst/porter-minecraft-dev.git"
BRANCH="main"

# Minecraft development server details.
VOLUME="minecraft-dev_minecraft-dev-data"
CONTAINER="minecraft-dev-minecraft-1"
PACK_DIR="/data/behavior_packs/porter-minecraft-dev"

# Local deployment state. The deployed SHA is only updated after a successful
# deployment so a failed commit will be retried on the next poll.
STATE_DIR="$HOME/minecraft_deployment"
DEPLOYED_SHA_FILE="$STATE_DIR/deployed_main_sha"
LOCK_FILE="/tmp/minecraft_dev_deploy.lock"
STAGE_DIR="$STATE_DIR/staging"

mkdir -p "$STATE_DIR"

# Prevent two cron runs from deploying at the same time.
if [[ -f "$LOCK_FILE" ]]; then
  echo "[INFO] Another Minecraft deployment is already running. Exiting."
  exit 0
fi

# The staging checkout is created by a root-running Docker container, so its
# files may not be removable by the QNAP user. Clean it up through Docker too.
cleanup() {
  rm -f "$LOCK_FILE"

  docker run --rm \
    -v "$STATE_DIR:/state" \
    alpine sh -c 'rm -rf /state/staging' >/dev/null 2>&1 || true
}

trap cleanup EXIT
touch "$LOCK_FILE"

# Niaj does not have Git installed. Use a disposable Alpine container for all
# Git operations and return only the remote SHA to the host.
REMOTE_SHA="$(
  docker run --rm alpine sh -c "
    apk add --no-cache git >/dev/null &&
    git ls-remote '$REPO_URL' 'refs/heads/$BRANCH' | awk '{print \$1}'
  "
)"

if [[ -z "$REMOTE_SHA" ]]; then
  echo "[ERROR] Could not determine remote SHA for $BRANCH"
  exit 1
fi

DEPLOYED_SHA=""
if [[ -f "$DEPLOYED_SHA_FILE" ]]; then
  DEPLOYED_SHA="$(cat "$DEPLOYED_SHA_FILE")"
fi

# Nothing to do if this commit has already been deployed successfully.
if [[ "$REMOTE_SHA" == "$DEPLOYED_SHA" ]]; then
  exit 0
fi

echo "[INFO] New main commit detected: $REMOTE_SHA"

# Clone into a host staging directory through a disposable Git container.
# The checkout is bind-mounted so the deployment container can read it later.
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"

docker run --rm   -v "$STAGE_DIR:/staging"   alpine sh -c "
    apk add --no-cache git >/dev/null &&
    git clone --quiet --depth 1 --branch '$BRANCH' '$REPO_URL' /tmp/repo &&
    cp -a /tmp/repo/. /staging/
  "

# Perform inexpensive validation before touching the running server.
echo "[INFO] Validating staged add-on..."
python3 -m json.tool "$STAGE_DIR/manifest.json" >/dev/null

if [[ ! -f "$STAGE_DIR/scripts/main.js" ]]; then
  echo "[ERROR] scripts/main.js is missing"
  exit 1
fi

# Verify the staged checkout is exactly the commit detected above. Again, Git
# runs inside a disposable container rather than on the QNAP host.
STAGED_SHA="$(
  docker run --rm     -v "$STAGE_DIR:/staging:ro"     alpine sh -c "
      apk add --no-cache git >/dev/null &&
      git -C /staging rev-parse HEAD
    "
)"

if [[ "$STAGED_SHA" != "$REMOTE_SHA" ]]; then
  echo "[ERROR] Staged SHA does not match remote SHA"
  exit 1
fi

echo "[INFO] Deploying $STAGED_SHA..."

# The Minecraft volume is not directly available on the QNAP host. Use a
# disposable Alpine container to copy the staged checkout into the volume.
# Build the replacement beside the live pack, then swap directories.
docker run --rm   -v "$VOLUME:/data"   -v "$STAGE_DIR:/staging:ro"   alpine sh -c "
    set -e

    rm -rf '$PACK_DIR.new'
    mkdir -p '$PACK_DIR.new'
    cp -a /staging/. '$PACK_DIR.new/'

    rm -rf '$PACK_DIR.previous'
    if [ -d '$PACK_DIR' ]; then
      mv '$PACK_DIR' '$PACK_DIR.previous'
    fi

    mv '$PACK_DIR.new' '$PACK_DIR'
  "

# BDS must restart to load the newly installed behavior pack.
echo "[INFO] Restarting Minecraft..."
docker restart "$CONTAINER" >/dev/null
sleep 8

# Basic health checks: the container must still be running, BDS must finish
# startup, and the expected behavior pack must appear in the startup logs.
if ! docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER"; then
  echo "[ERROR] Minecraft container is not running after deployment"
  exit 1
fi

LOGS="$(docker logs --since 30s "$CONTAINER" 2>&1)"

if ! printf '%s\n' "$LOGS" | grep -q "Server started"; then
  echo "[ERROR] Minecraft did not report a successful startup"
  exit 1
fi

if ! printf '%s\n' "$LOGS" | grep -q "My First Minecraft Mod"; then
  echo "[ERROR] Porter behavior pack was not reported in startup logs"
  exit 1
fi

# Only a verified deployment becomes the new known-good commit.
printf '%s\n' "$STAGED_SHA" > "$DEPLOYED_SHA_FILE"
echo "[OK] Deployed $STAGED_SHA successfully"
