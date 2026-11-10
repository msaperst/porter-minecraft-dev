#!/usr/bin/env bash
set -euo pipefail

export HOME="/share/homes/msaperst"
export PATH="/share/CACHEDEV1_DATA/.qpkg/container-station/bin:/share/CACHEDEV1_DATA/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

REPO_URL="https://github.com/msaperst/porter-minecraft-dev.git"
BRANCH="main"
VOLUME="minecraft-dev_minecraft-dev-data"
CONTAINER="minecraft-dev-minecraft-1"
STATE_DIR="$HOME/minecraft_deployment"
STAGE_DIR="$STATE_DIR/staging"
SHA_FILE="$STATE_DIR/deployed_main_sha"
LOCK_DIR="/tmp/minecraft_dev_deploy.lock.d"

mkdir -p "$STATE_DIR"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[INFO] Deployment already running"
  exit 0
fi
cleanup() {
  docker run --rm -v "$STATE_DIR:/state" alpine sh -c 'rm -rf /state/staging' >/dev/null 2>&1 || true
  rmdir "$LOCK_DIR" 2>/dev/null || true
}
trap cleanup EXIT

REMOTE_SHA="$(docker run --rm alpine sh -ec "apk add --no-cache git >/dev/null; git ls-remote '$REPO_URL' 'refs/heads/$BRANCH' | awk '{print \$1}'")"
[[ -n "$REMOTE_SHA" ]] || { echo '[ERROR] Unable to resolve remote commit'; exit 1; }
[[ "$(cat "$SHA_FILE" 2>/dev/null || true)" != "$REMOTE_SHA" ]] || exit 0

echo "[INFO] New main commit detected: $REMOTE_SHA"
# All checkout work is isolated; the live pack is not modified yet.
docker run --rm -v "$STATE_DIR:/state" alpine sh -ec 'rm -rf /state/staging; mkdir -p /state/staging'
docker run --rm -v "$STAGE_DIR:/staging" alpine sh -ec "apk add --no-cache git >/dev/null; git clone --quiet --depth 1 --branch '$BRANCH' '$REPO_URL' /tmp/repo; cp -a /tmp/repo/. /staging/"
STAGED_SHA="$(docker run --rm -v "$STAGE_DIR:/staging:ro" alpine sh -ec 'apk add --no-cache git >/dev/null; git -C /staging rev-parse HEAD')"
[[ "$STAGED_SHA" == "$REMOTE_SHA" ]] || { echo '[ERROR] Checkout changed during deployment; retry next poll'; exit 1; }

# Validate the manifest and extract the identity that the world must activate.
python3 - "$STAGE_DIR" <<'PY'
import json, pathlib, sys, uuid
root = pathlib.Path(sys.argv[1])
m = json.loads((root / 'manifest.json').read_text())
h = m['header']
uuid.UUID(h['uuid'])
version = h['version']
assert isinstance(version, list) and len(version) == 3 and all(type(v) is int and v >= 0 for v in version)
assert isinstance(h['name'], str) and h['name'].strip()
modules = m['modules']
assert any(x.get('type') == 'script' and (root / x['entry']).is_file() for x in modules)
assert (root / 'scripts/main.js').is_file()
print(f"[INFO] Validated pack: {h['name']} ({h['uuid']}, {version})")
PY

# A single disposable container owns all changes to the Minecraft data volume.
# Snapshots are stored OUTSIDE behavior_packs so BDS cannot discover them.
# The old world configuration is preserved byte-for-byte for rollback.
echo "[INFO] Installing staged pack and synchronizing world activation..."
docker run --rm -i \
  -v "$VOLUME:/data" -v "$STAGE_DIR:/staging:ro" \
  python:3.12-alpine python - <<'PYDEPLOY'
import json, pathlib, shutil
base = pathlib.Path('/data')
packs = base / 'behavior_packs'
live = packs / 'porter-minecraft-dev'
world = base / 'worlds' / 'Bedrock level' / 'world_behavior_packs.json'
backup = base / 'minecraft_deploy_backup'
staged = pathlib.Path('/staging')
new = json.loads((staged / 'manifest.json').read_text())['header']
old_id = None
if (live / 'manifest.json').is_file():
    old_id = json.loads((live / 'manifest.json').read_text())['header']['uuid']
if not world.is_file():
    raise SystemExit(f'[ERROR] Missing world pack activation file: {world}')
entries = json.loads(world.read_text())
if not isinstance(entries, list):
    raise SystemExit('[ERROR] World pack activation is not a list')
# Preserve the existing activation list for rollback.
if backup.exists():
    shutil.rmtree(backup)
backup.mkdir()
shutil.copy2(world, backup / 'world_behavior_packs.json')
if live.is_dir():
    shutil.copytree(live, backup / 'pack')
# Replace the old pack ID, or add this pack if no matching entry exists.
new_entry = {'pack_id': new['uuid'], 'version': new['version']}
updated = []
for entry in entries:
    if entry.get('pack_id') not in (old_id, new['uuid']):
        updated.append(entry)
updated.append(new_entry)
# Stage the replacement outside the active pack directory.
replacement = base / 'minecraft_deploy_candidate'
if replacement.exists():
    shutil.rmtree(replacement)
shutil.copytree(staged, replacement, ignore=shutil.ignore_patterns('.git'))
if live.exists():
    shutil.rmtree(live)
shutil.move(str(replacement), str(live))
world.write_text(json.dumps(updated, indent=2) + '\n')
print(f"[INFO] World now activates {new['name']} ({new['uuid']})")
PYDEPLOY

# Compare only logs generated after THIS restart. Do not rely on pack names.
EXPECTED_UUID="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["header"]["uuid"])' "$STAGE_DIR/manifest.json")"
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo '[INFO] Restarting Minecraft...'
docker restart "$CONTAINER" >/dev/null

verify_new() {
  local logs
  for _ in $(seq 1 12); do
    sleep 2
    logs="$(docker logs --since "$STARTED_AT" "$CONTAINER" 2>&1)"
    if printf '%s\n' "$logs" | grep -Fq 'Server started.'; then
      if printf '%s\n' "$logs" | grep -F 'Pack Stack' | grep -Fq "id: $EXPECTED_UUID"; then
        return 0
      fi
      echo "[ERROR] Server started without expected pack UUID $EXPECTED_UUID"
      return 1
    fi
  done
  echo '[ERROR] Server did not report successful startup'
  return 1
}

if verify_new; then
  printf '%s\n' "$STAGED_SHA" > "$SHA_FILE"
  echo "[OK] Deployed $STAGED_SHA successfully"
  exit 0
fi

echo '[INFO] Restoring previous pack and world activation...'
docker run --rm -i -v "$VOLUME:/data" python:3.12-alpine python - <<'PYROLLBACK'
import pathlib, shutil
base = pathlib.Path('/data')
backup = base / 'minecraft_deploy_backup'
live = base / 'behavior_packs' / 'porter-minecraft-dev'
world = base / 'worlds' / 'Bedrock level' / 'world_behavior_packs.json'
if not (backup / 'world_behavior_packs.json').exists():
    raise SystemExit('[ERROR] Missing rollback snapshot')
if live.exists():
    shutil.rmtree(live)
if (backup / 'pack').exists():
    shutil.copytree(backup / 'pack', live)
shutil.copy2(backup / 'world_behavior_packs.json', world)
print('[INFO] Restored previous behavior pack and world configuration')
PYROLLBACK

docker restart "$CONTAINER" >/dev/null
echo '[ERROR] New pack failed verification; previous configuration restored. Deployment SHA unchanged.'
exit 1
