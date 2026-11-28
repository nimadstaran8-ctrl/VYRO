# VYRO CI/CD

GitHub Actions runs lint, tests, and a production build on pull requests to `main` and pushes to `main`. A deployment request runs those same checks and publishes its tested build to the VPS. It checks the storefront and its entry script against the local Nginx HTTPS endpoint. A failed check restores the previous release.

## Deploy from Windows

From the repository root, run this in PowerShell after committing your changes on local `main`:

```powershell
.\deploy\publish.ps1
```

The script uses your Git Credential Manager sign-in or the `GH_TOKEN` environment variable for GitHub Actions. Your Git account must be allowed to push to `main`, and the API credential must be able to read repository variables and run Actions. The script checks that deployment is enabled and that the working tree is clean before pushing the exact local commit without force. It can also redeploy the same commit. It waits for the exact workflow run and reports success after the VPS verifies the deployed build.

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

Once the workflow is merged into `main` and the settings above are in place, use the PowerShell command for the first deployment.

## Public footer settings

The owner updates the public phone number and Instagram, TikTok, and Telegram links in Admin → Footer & Social Media Settings. The form requires the separate owner password. A blank field disables its link. The VPS stores the settings in `/var/lib/vyro-storefront-phone/footer.json` across releases.

On a new Ubuntu VPS, install `deploy/storefront-phone.py` as `/usr/local/lib/vyro/storefront-phone.py`, install `deploy/vyro-storefront-phone.service` in `/etc/systemd/system/`, and enable it with `sudo systemctl enable --now vyro-storefront-phone`. Install `deploy/storefront-phone.nginx` as `/etc/nginx/snippets/vyro-storefront-phone.conf` and include it inside the storefront's Nginx server block. Use LF line endings when copying the files.

To transfer ownership, create a new strong password in a password manager and replace the `owner` password on the VPS. With `htpasswd` (from `apache2-utils`) installed, run `sudo htpasswd -B /etc/nginx/vyro-storefront-phone.htpasswd owner`. Use `-c` only when the file does not exist. Ensure the file is owned by `root:www-data` with mode `0640`. Validate and reload Nginx using `sudo nginx -t` and `sudo systemctl reload nginx`. Give the new owner the password through a private channel.
