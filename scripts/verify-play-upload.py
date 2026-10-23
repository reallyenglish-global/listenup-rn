"""Read back exact release in a fresh Play edit, then discard that verification edit."""
import base64
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.reallyenglish.listenup/edits'
TOKEN_URL = 'https://oauth2.googleapis.com/token'


def json_request(url, method='GET', body=None, token=None, form=False):
    headers = {'Content-Type': 'application/x-www-form-urlencoded' if form else 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    data = None if body is None else (urlencode(body).encode() if form else json.dumps(body).encode())
    try:
        with urlopen(Request(url, data=data, headers=headers, method=method), timeout=45) as response:
            result = response.read(2_000_000)
            return json.loads(result) if result else {}
    except HTTPError as exc:
        # Never include request bodies, auth material or upstream response text.
        raise RuntimeError(f'Play verification HTTP {exc.code}; inspect Play Console before retrying') from None


def check_track(track, code, expected_track='internal', expected_status='draft'):
    if expected_track not in ('internal', 'production') or expected_status not in ('draft', 'completed'):
        raise ValueError('Invalid expected Play destination or status')
    if track.get('track') != expected_track or not any(
        r.get('status') == expected_status and str(code) in r.get('versionCodes', [])
        for r in track.get('releases', [])
    ):
        raise ValueError('Expected versionCode not found on requested track with requested status; inspect Play Console before retrying')


def check_bundle(bundles, code, sha256):
    matches = [b for b in bundles.get('bundles', []) if str(b.get('versionCode')) == str(code)]
    if len(matches) != 1 or str(matches[0].get('sha256', '')).lower() != sha256:
        raise ValueError('Play bundle checksum does not match the exact built artifact')


def main():
    code = os.environ['PLAY_VERSION_CODE']
    sha256 = os.environ['PLAY_AAB_SHA256']
    if not re.fullmatch(r'[0-9a-f]{64}', sha256):
        raise ValueError('Invalid expected bundle SHA256')
    if not re.fullmatch(r'[1-9][0-9]*', code):
        raise ValueError('Invalid versionCode')
    track = os.environ['PLAY_TRACK']
    status = os.environ['PLAY_STATUS']
    if track not in ('internal', 'production') or status not in ('draft', 'completed'):
        raise ValueError('Invalid expected Play destination or status')
    account = json.loads(os.environ['PLAY_SERVICE_ACCOUNT_JSON'])
    if account.get('type') != 'service_account':
        raise ValueError('Expected service-account JSON')
    def encode(obj):
        return base64.urlsafe_b64encode(json.dumps(obj, separators=(',', ':')).encode()).rstrip(b'=')
    now = int(time.time())
    payload = {'iss': account['client_email'], 'scope': 'https://www.googleapis.com/auth/androidpublisher', 'aud': TOKEN_URL, 'iat': now, 'exp': now + 300}
    unsigned = encode({'alg': 'RS256', 'typ': 'JWT'}) + b'.' + encode(payload)
    with tempfile.TemporaryDirectory(prefix='play-verify-', dir=os.environ['RUNNER_TEMP']) as tmp:
        key = Path(tmp) / 'key.pem'
        key.touch(mode=0o600)
        key.write_text(account['private_key'])
        signed = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', str(key)], input=unsigned, capture_output=True, check=False)
        if signed.returncode:
            raise RuntimeError('Could not sign Play verification assertion')
    assertion = (unsigned + b'.' + base64.urlsafe_b64encode(signed.stdout).rstrip(b'=')).decode()
    token = json_request(TOKEN_URL, 'POST', {'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion': assertion}, form=True)['access_token']
    edit = json_request(BASE, 'POST', {}, token)['id']
    if not re.fullmatch(r'[A-Za-z0-9_-]+', edit):
        raise RuntimeError('Unexpected Play edit ID')
    checked = False
    try:
        check_track(json_request(BASE + '/' + edit + '/tracks/' + track, token=token), code, track, status)
        check_bundle(json_request(BASE + '/' + edit + '/bundles', token=token), code, sha256)
        checked = True
    finally:
        # Verification edit is never committed, so no second release mutation occurs.
        try:
            json_request(BASE + '/' + edit, 'DELETE', token=token)
        except Exception:
            print('Warning: uncommitted verification edit could not be deleted; it will expire. Inspect Play Console before retrying.', file=sys.stderr)
            if checked:
                raise
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as summary:
        summary.write(f'### Verified Play upload\nVersion code {code} and SHA256 {sha256} were read back on {track} with status {status}. Play review/availability and device acceptance remain separate.\n')
    print(f'Verified {track} {status} versionCode {code}')


if __name__ == '__main__':
    main()
