#!/usr/bin/env python3
import json
import os
import re
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from socketserver import UnixStreamServer
from urllib.parse import urlsplit


SOCKET = Path("/run/vyro-storefront-phone/http.sock")
STATE = Path("/var/lib/vyro-storefront-phone/footer.json")
SOCIAL_LINKS = {"instagram", "tiktok", "telegram"}


def valid_url(value):
    if not isinstance(value, str) or len(value) > 1024:
        return False
    if not value:
        return True
    if re.search(r"[\s\x00-\x1f\x7f\\]", value):
        return False
    url = urlsplit(value)
    return url.scheme == "https" and bool(url.hostname) and url.username is None and url.port != 0


class PhoneHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def respond(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            data = json.loads(STATE.read_text())
        except FileNotFoundError:
            data = {}
        self.respond(200, data)

    def do_PUT(self):
        if self.headers.get_content_type() != "application/json":
            self.respond(415, {"error": "expected JSON"})
            return
        try:
            size = int(self.headers["Content-Length"])
            if not 1 <= size <= 8192:
                raise ValueError
            data = json.loads(self.rfile.read(size))
            if not isinstance(data, dict) or data.keys() != SOCIAL_LINKS | {"phone"}:
                raise ValueError
            phone = data["phone"]
            if not isinstance(phone, str) or not re.fullmatch(r"\+?[0-9]{7,15}|", phone):
                raise ValueError
            if not all(valid_url(data[key]) for key in SOCIAL_LINKS):
                raise ValueError
        except (ValueError, TypeError, KeyError):
            self.respond(400, {"error": "invalid footer settings"})
            return

        pending = STATE.with_suffix(".tmp")
        pending.write_text(json.dumps(data))
        os.replace(pending, STATE)
        self.respond(200, data)


if __name__ == "__main__":
    SOCKET.unlink(missing_ok=True)
    with UnixStreamServer(str(SOCKET), PhoneHandler) as server:
        SOCKET.chmod(0o660)
        server.serve_forever()
