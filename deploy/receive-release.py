#!/usr/bin/env python3
"""Receive a static VYRO release through the deployment account's forced command."""

import fcntl
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import signal
import subprocess
import sys
import tarfile
import tempfile

ROOT = Path("/var/www/vyro-deploy")
RELEASES = ROOT / "releases"
CURRENT = ROOT / "current"
DOMAIN = "vyro-shop.ir"
MAX_RELEASE_BYTES = 256 * 1024 * 1024
RELEASE_NAME = re.compile(r"[0-9a-f]{40}-[a-z0-9_]+")
ENTRY_SCRIPT = re.compile(rb'<script\b[^>]*\bsrc=["\'](/assets/[^"\']+\.js)["\']')


def unpack(site):
    assets = []
    total_bytes = 0
    with tarfile.open(fileobj=sys.stdin.buffer, mode="r|gz") as archive:
        for member in archive:
            path = PurePosixPath(member.name)
            if path.is_absolute() or ".." in path.parts:
                raise ValueError(f"Invalid archive path: {member.name}")
            if member.isdir():
                continue
            if not member.isfile() or not path.parts:
                raise ValueError(f"Invalid archive entry: {member.name}")
            total_bytes += member.size
            if total_bytes > MAX_RELEASE_BYTES:
                raise ValueError("Release exceeds 256 MiB unpacked")
            target = site.joinpath(*path.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with archive.extractfile(member) as source, target.open("xb") as destination:
                shutil.copyfileobj(source, destination)
            if path.parts[0] == "assets":
                assets.append(path.as_posix())
    return assets


def switch(target, pending):
    pending.symlink_to(target)
    pending.replace(CURRENT)


def check_origin(site, index, asset):
    for url_path, expected in (("/", index), (f"/{asset}", (site / asset).read_bytes())):
        served = subprocess.check_output(
            [
                "curl", "--noproxy", "*", "--fail", "--silent", "--show-error",
                "--max-time", "10", "--resolve", f"{DOMAIN}:443:127.0.0.1",
                f"https://{DOMAIN}{url_path}",
            ]
        )
        if served != expected:
            raise ValueError(f"Nginx served unexpected content for {url_path}")


def deploy(commit):
    previous = CURRENT.readlink()
    old_site = (ROOT / previous).resolve(strict=True)
    if old_site.name != "site" or old_site.parent.parent != RELEASES:
        raise ValueError(f"Unexpected current release: {previous}")

    release = Path(tempfile.mkdtemp(prefix=f"{commit}-", dir=RELEASES))
    site = release / "site"
    pending = ROOT / f".current-{release.name}"
    target = site.relative_to(ROOT)
    verified = False
    try:
        site.mkdir()
        assets = unpack(site)
        index = (site / "index.html").read_bytes()
        script = ENTRY_SCRIPT.search(index)
        if not script or (asset := script[1].decode()[1:]) not in assets:
            raise ValueError("The build is missing the entry script referenced from index.html")

        # Keep bundles from the immediately preceding build for already open pages.
        old_manifest = old_site.parent / "assets.txt"
        if old_manifest.is_file():
            for name in old_manifest.read_text().splitlines():
                destination = site / name
                if not destination.exists():
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(old_site / name, destination)
        (release / "assets.txt").write_text("\n".join(assets) + "\n")

        release.chmod(0o755)
        switch(target, pending)
        check_origin(site, index, asset)
        verified = True
    finally:
        if not verified:
            if CURRENT.readlink() == target:
                switch(previous, pending)
                print(f"Restored {previous}", file=sys.stderr)
            pending.unlink(missing_ok=True)
            shutil.rmtree(release)

    retained = {release, old_site.parent}
    for entry in RELEASES.iterdir():
        if entry not in retained and RELEASE_NAME.fullmatch(entry.name) and entry.is_dir():
            try:
                shutil.rmtree(entry)
            except OSError as error:
                print(f"Could not prune {entry}: {error}", file=sys.stderr)
    print(f"Published {commit}")


def main():
    command = re.fullmatch(r"deploy ([0-9a-f]{40})", os.environ.get("SSH_ORIGINAL_COMMAND", ""))
    if not command:
        raise SystemExit("Expected deploy followed by a Git commit SHA")

    def interrupt(signum, _frame):
        raise SystemExit(128 + signum)

    signal.signal(signal.SIGHUP, interrupt)
    signal.signal(signal.SIGTERM, interrupt)
    os.umask(0o022)
    with (ROOT / ".deploy.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        deploy(command[1])


if __name__ == "__main__":
    main()
