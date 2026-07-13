#!/usr/bin/env python3
"""Cloudflare Pages direct upload deploy script"""
import json, hashlib, os, io, mimetypes, sys, urllib.request

ACCOUNT_ID = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("CF_ACCOUNT_ID", "")
API_TOKEN = os.environ.get("CF_API_TOKEN", "")
EMAIL = os.environ.get("CF_EMAIL", "")
API_KEY = os.environ.get("CF_API_KEY", "")

PROJECT = "jpreki-top"
DIST_DIR = "dist"

if not ACCOUNT_ID:
    print("Error: CF_ACCOUNT_ID not set")
    sys.exit(1)
if not API_TOKEN and not (EMAIL and API_KEY):
    print("Error: CF_API_TOKEN or CF_EMAIL+CF_API_KEY required")
    sys.exit(1)

# 構建 manifest 和文件列表
manifest = {}
files_data = []

for root, dirs, fnames in os.walk(DIST_DIR):
    for fname in fnames:
        fpath = os.path.join(root, fname)
        rel_path = os.path.relpath(fpath, DIST_DIR)
        with open(fpath, 'rb') as f:
            content = f.read()
        sha1 = hashlib.sha1(content).hexdigest()
        manifest[rel_path] = sha1
        files_data.append((rel_path, content, fname))

print(f"Uploading {len(files_data)} files...")

# 構建 multipart/form-data
boundary = "----FormBoundary" + hashlib.md5(os.urandom(16)).hexdigest()
body = io.BytesIO()

body.write(f"--{boundary}\r\n".encode())
body.write(b'Content-Disposition: form-data; name="manifest"\r\n')
body.write(b"Content-Type: application/json\r\n\r\n")
body.write(json.dumps(manifest).encode())
body.write(b"\r\n")

for rel_path, content, fname in files_data:
    body.write(f"--{boundary}\r\n".encode())
    mime_type = mimetypes.guess_type(fname)[0] or "application/octet-stream"
    body.write(f'Content-Disposition: form-data; name="{rel_path}"; filename="{rel_path}"\r\n'.encode())
    body.write(f"Content-Type: {mime_type}\r\n\r\n".encode())
    body.write(content)
    body.write(b"\r\n")

body.write(f"--{boundary}--\r\n".encode())

# 發送請求
url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT}/deployments"
headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}

if API_TOKEN:
    headers["Authorization"] = f"Bearer {API_TOKEN}"
else:
    headers["X-Auth-Email"] = EMAIL
    headers["X-Auth-Key"] = API_KEY

req = urllib.request.Request(url, data=body.getvalue(), headers=headers, method="POST")
try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    if result.get("success"):
        r = result["result"]
        print(f"Deployed! ID: {r.get('id')}")
        print(f"URL: {r.get('url', 'N/A')}")
    else:
        print(f"Error: {result.get('errors')}")
        sys.exit(1)
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode()[:500]}")
    sys.exit(1)