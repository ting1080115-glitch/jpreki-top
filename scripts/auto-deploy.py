#!/usr/bin/env python3
"""
JPREKI Top - Auto deploy to Cloudflare Pages
Checks for GitHub changes and deploys if needed.
"""
import json, hashlib, os, io, mimetypes, sys, urllib.request, subprocess, time

PROJECT_DIR = "/tmp/jpreki-top"
DIST_DIR = os.path.join(PROJECT_DIR, "dist")
ACCOUNT_ID = "272757d08aaf17e1ddfa2189b2ac76bc"
EMAIL = "ting1080115@gmail.com"
API_KEY = "12fb1dbce19306dd97982cff9993422022200"

def run(cmd, cwd=PROJECT_DIR):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=60)
    return result.returncode, result.stdout, result.stderr

def deploy():
    """Deploy to Cloudflare Pages via direct upload"""
    if not os.path.exists(DIST_DIR):
        print("dist/ not found, building...")
        rc, out, err = run(["npm", "run", "build"])
        if rc != 0:
            print(f"Build failed: {err}")
            return False

    # Build manifest
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

    print(f"Deploying {len(files_data)} files...")

    # Build multipart
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

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/jpreki-top/deployments"
    headers = {
        "X-Auth-Email": EMAIL,
        "X-Auth-Key": API_KEY,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }

    req = urllib.request.Request(url, data=body.getvalue(), headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        if result.get("success"):
            r = result["result"]
            print(f"✅ Deployed! ID: {r.get('id')}, URL: https://{r.get('url', '')}")
            return True
        else:
            print(f"❌ Deploy failed: {result.get('errors')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    # Pull from GitHub
    rc, out, err = run(["git", "fetch", "origin", "main"])
    if rc != 0:
        print(f"Git fetch failed: {err}")
        return

    # Check if we're behind
    rc, out, err = run(["git", "rev-list", "HEAD..origin/main", "--count"])
    if rc != 0:
        print(f"Git rev-list failed: {err}")
        return

    behind = int(out.strip() or "0")
    if behind == 0:
        print("No changes. Skipping deploy.")
        return

    print(f"Found {behind} new commit(s). Pulling...")
    rc, out, err = run(["git", "pull", "origin", "main"])
    if rc != 0:
        print(f"Git pull failed: {err}")
        return

    # Rebuild and deploy
    print("Rebuilding...")
    rc, out, err = run(["npm", "run", "build"])
    if rc != 0:
        print(f"Build failed: {err}")
        return

    deploy()

if __name__ == "__main__":
    main()