# VYRO CI/CD

GitHub Actions runs lint, tests, and a production build on pull requests to `main` and pushes to `main`. With deployment enabled, the production job publishes that same build to the VPS. It checks the storefront and its entry script against the local Nginx HTTPS endpoint. A failed check restores the previous release.

## Prepare the VPS

Run the setup as an administrator on the Ubuntu VPS. Use a dedicated Ed25519 key for GitHub Actions. Keep the private key in the GitHub production environment.

1. Upload [receive-release.py](../deploy/receive-release.py) to the VPS through your administrative SSH session and install it as a root-owned file.

   ```bash
   sudo useradd --create-home --shell /bin/sh vyro-deploy
   sudo install -o root -g root -m 0755 receive-release.py /usr/local/bin/vyro-receive-release
   sudo install -d -o vyro-deploy -g vyro-deploy -m 0755 \
     /var/www/vyro-deploy /var/www/vyro-deploy/releases \
     /var/www/vyro-deploy/releases/legacy /var/www/vyro-deploy/releases/legacy/site
   sudo -u vyro-deploy cp -R /var/www/VYRO/dist/. /var/www/vyro-deploy/releases/legacy/site/
   sudo -u vyro-deploy sh -c 'cd /var/www/vyro-deploy/releases/legacy/site && find assets -type f > ../assets.txt'
   sudo -u vyro-deploy ln -s releases/legacy/site /var/www/vyro-deploy/current
   sudo install -d -o vyro-deploy -g vyro-deploy -m 0700 /home/vyro-deploy/.ssh
   ```

2. Create `/home/vyro-deploy/.ssh/authorized_keys` with mode `0600`, owned by `vyro-deploy`. Add the deployment public key on one line, prefixed by the options below.

   ```text
   restrict,command="/usr/local/bin/vyro-receive-release" ssh-ed25519 PUBLIC_KEY_HERE github-actions-vyro
   ```

3. In the active VYRO Nginx configuration, set the storefront document root to `/var/www/vyro-deploy/current`. Keep the current domain, certificate paths, ACME challenge handling, and SPA routes. Check the configuration with `sudo nginx -t`, reload with `sudo systemctl reload nginx`, and confirm that `https://vyro-shop.ir/` still serves the existing build.

## Enable publishing in GitHub

Create the `production` GitHub environment and configure it to allow deployments from `main`. Configure these values.

| Setting | Scope | Value |
| --- | --- | --- |
| `VYRO_VPS_HOST` | Environment variable | `185.26.32.238` |
| `VYRO_VPS_USER` | Environment variable | `vyro-deploy` |
| `VYRO_VPS_SSH_KEY` | Environment secret | Dedicated private SSH key |
| `VYRO_VPS_KNOWN_HOSTS` | Environment secret | Verified SSH host key in OpenSSH known_hosts format for `185.26.32.238` |
| `VYRO_DEPLOY_ENABLED` | Repository variable | `true` after the VPS and environment are ready |

Run **CI/CD** on `main` from the Actions tab for the first deployment. Check the deployment log and reload the public storefront.
