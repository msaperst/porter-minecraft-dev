# Minecraft Development Deployment

These scripts automate deployment of Porter's Minecraft behavior pack from the public `main` branch to the development Bedrock server on Niaj.

The scripts are version controlled here, but are **manually installed on Niaj**. A push can deploy Minecraft content; it cannot update the deployment infrastructure itself.

## Install on Niaj

Copy both shell scripts to:

```text
/share/homes/msaperst/minecraft_scripts/
```

Then run:

```bash
chmod +x /share/homes/msaperst/minecraft_scripts/*.sh
mkdir -p /share/homes/msaperst/minecraft_logs
mkdir -p /share/homes/msaperst/minecraft_deployment
```

## Test Manually

Before installing cron, run the wrapper directly:

```bash
/share/homes/msaperst/minecraft_scripts/run_minecraft_deploy.sh
```

The first run should deploy the current `main` commit. A later run with no new commit should return silently.

A successful deployment ends with:

```text
[OK] Deployment finished: ...
```

The deployment state is stored in:

```text
/share/homes/msaperst/minecraft_deployment/deployed_main_sha
```

Deployment logs are stored in:

```text
/share/homes/msaperst/minecraft_logs/
```

## Cron

After a successful manual test, add this to Niaj's **root crontab**:

```cron
* * * * * /share/homes/msaperst/minecraft_scripts/run_minecraft_deploy.sh
```

The wrapper polls GitHub once per minute. If `main` has not changed, it exits without creating a log. Every actual deployment attempt gets a timestamped log.

### QNAP Cron Gotcha

Niaj's QNAP cron has previously exhibited **stale/cached job configuration** after cron changes. In particular, an old configuration has continued running alongside a new configuration, causing jobs to execute twice. Reloading cron did not resolve that incident; a full NAS restart ultimately cleared the stale state.

After adding or changing the Minecraft cron job:

1. Verify the saved/root crontab:
   ```bash
   sudo crontab -l
   ```
2. Verify the active cron configuration if the job does not behave as expected.
3. Watch the Minecraft deployment logs for the first execution.
4. If an old job appears to still be running, **do not add another cron entry**. Check for duplicate/stale configuration first.
5. If the QNAP cron process retains stale configuration, a full NAS restart may be required.

The deployment script has its own lock file, so an overlapping invocation will exit rather than perform a second deployment.

## Deployment flow

For a new `main` commit, the deployment script:

1. Checks the current GitHub `main` SHA using a disposable Alpine container because Git is not installed on Niaj.
2. Clones the repository into a temporary staging directory using the same disposable container approach.
3. Validates `manifest.json` and `scripts/main.js`.
4. Installs the staged pack into the persistent Minecraft volume.
5. Restarts BDS.
6. Verifies that Minecraft starts and the behavior pack is loaded.
7. Records the successfully deployed SHA in:
   ```text
   /share/homes/msaperst/minecraft_deployment/deployed_main_sha
   ```

If post-deployment verification fails, the script restores the previous behavior pack, restarts BDS again, and does **not** record the new SHA as successfully deployed.

## Updating Deployment Tooling

Do not edit the installed Niaj copies as the source of truth. Change these files in Git, review/commit them, and manually copy the approved versions to Niaj.

Do not install the cron job until the scripts have been tested manually.

The deployment scripts intentionally depend only on the shell environment and Docker available on Niaj; Git is run inside disposable containers rather than installed on the NAS.
