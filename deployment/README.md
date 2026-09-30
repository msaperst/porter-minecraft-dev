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

## Cron

After a successful manual test, add:

```cron
* * * * * /share/homes/msaperst/minecraft_scripts/run_minecraft_deploy.sh
```

The wrapper polls GitHub once per minute. If `main` has not changed, it exits without creating a log. Every actual deployment attempt gets a timestamped log under `/share/homes/msaperst/minecraft_logs/`.

## Deployment flow

For a new `main` commit, the deployment script clones to staging, validates `manifest.json` and `scripts/main.js`, installs the staged pack into the persistent Minecraft volume, restarts BDS, verifies startup and pack loading, and records the successfully deployed SHA in:

```text
/share/homes/msaperst/minecraft_deployment/deployed_main_sha
```

## Updating deployment tooling

Do not edit the installed Niaj copies as the source of truth. Change these files in Git, review/commit them, and manually copy the approved versions to Niaj.

Do not install the cron job until the scripts have been tested manually.
