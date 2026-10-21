"""Inspect the real signed AAB with pinned bundletool; no publisher writes."""
import hashlib
import json
import os
from pathlib import Path
import re
import ssl
import subprocess
import xml.etree.ElementTree as ET
import zipfile


def check_manifest(xml, version_code, version, require_play):
    root = ET.fromstring(xml)
    attr = '{http://schemas.android.com/apk/res/android}'
    if root.get('package') != 'com.reallyenglish.listenup':
        raise ValueError('AAB package does not match ListenUp')
    if root.get(attr + 'versionCode') != str(version_code) or root.get(attr + 'versionName') != version:
        raise ValueError('AAB version does not match requested release')
    app = root.find('application')
    if app is None or app.get(attr + 'debuggable', 'false') != 'false' or app.get(attr + 'testOnly', 'false') != 'false':
        raise ValueError('Refusing debug/test-only bundle')
    sdk = root.find('uses-sdk')
    target = int(sdk.get(attr + 'targetSdkVersion', '0')) if sdk is not None else 0
    if require_play and target < 36:
        raise ValueError('Play upload blocked: targetSdkVersion < 36. Upgrade Expo/RN; do not just raise the target override.')
    return target


def main():
    aab = Path('android/app/build/outputs/bundle/release/app-release.aab')
    jar = os.environ['BUNDLETOOL_JAR']
    def command(args):
        return subprocess.check_output(args, text=True, env={**os.environ, 'LC_ALL': 'C'})
    verified = command(['jarsigner', '-verify', str(aab)])
    if 'jar verified.' not in verified:
        raise ValueError('Bundle signature not verified')
    with zipfile.ZipFile(aab) as archive:
        signers = [n for n in archive.namelist() if re.fullmatch(r'META-INF/[^/]+\.(RSA|DSA|EC)', n, re.I)]
        if len(signers) != 1:
            raise ValueError('Expected exactly one bundle signer')
    expected = command(['keytool', '-exportcert', '-rfc', '-keystore', os.environ['PLAY_KEYSTORE_PATH'], '-storepass:env', 'PLAY_STORE_PASSWORD', '-alias', os.environ['PLAY_KEY_ALIAS']])
    actual = command(['keytool', '-printcert', '-rfc', '-jarfile', str(aab)])
    cert = r'-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----'
    expected_der = ssl.PEM_cert_to_DER_cert(re.search(cert, expected, re.S).group())
    actual_der = ssl.PEM_cert_to_DER_cert(re.search(cert, actual, re.S).group())
    if actual_der != expected_der:
        raise ValueError('Bundle signer does not match upload key')
    command(['java', '-jar', jar, 'validate', '--bundle=' + str(aab)])
    xml = command(['java', '-jar', jar, 'dump', 'manifest', '--bundle=' + str(aab), '--module=base'])
    version = json.loads(Path('app.json').read_text())['expo']['version']
    target = check_manifest(xml, os.environ['PLAY_VERSION_CODE'], version, os.environ['PLAY_UPLOAD'] == 'true')
    out = Path('play-artifact'); out.mkdir(exist_ok=True)
    bundle = out / 'listenup.aab'; bundle.write_bytes(aab.read_bytes())
    digest = hashlib.sha256(bundle.read_bytes()).hexdigest()
    with open(os.environ['GITHUB_OUTPUT'], 'a') as outputs:
        outputs.write(f'aab_sha256={digest}\n')
    (out / 'SHA256SUMS').write_text(f'{digest}  listenup.aab\n')
    (out / 'release.json').write_text(json.dumps({'sha': os.environ['GITHUB_SHA'], 'version': version, 'versionCode': int(os.environ['PLAY_VERSION_CODE']), 'targetSdkVersion': target, 'track': 'internal', 'status': 'draft', 'uploadKeySha256': hashlib.sha256(expected_der).hexdigest()}, indent=2) + '\n')
    print(f'Verified signed ListenUp AAB; target API {target}; SHA256 {digest}')


if __name__ == '__main__':
    main()
