"""Verify a retained signed AAB for human approval; never rebuild or call Play APIs."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import ssl
import subprocess
import sys
import tempfile
import zipfile

REPOSITORY = 'reallyenglish-global/listenup-rn'
PACKAGE = 'com.reallyenglish.listenup'
BUNDLETOOL_SHA256 = 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29'


def literal(value, pattern, name):
    if not isinstance(value, str) or not re.fullmatch(pattern, value):
        raise ValueError(f'Invalid literal {name}')
    return value


def file_hash(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def validate_request(env):
    if (env.get('GITHUB_EVENT_NAME') != 'workflow_dispatch' or
            env.get('GITHUB_REF') != 'refs/heads/production' or
            env.get('GITHUB_REPOSITORY') != REPOSITORY):
        raise ValueError('Upload approval requires manual production dispatch in the product repository')
    if env.get('REQUEST_INTERNAL_DRAFT') != 'true':
        raise ValueError('Explicit internal draft upload approval request is required')
    code = int(literal(env.get('EXPECTED_VERSION_CODE'), r'[1-9][0-9]{0,9}', 'version code'))
    maximum = int(literal(env.get('CONSOLE_MAX_VERSION_CODE'), r'0|[1-9][0-9]{0,9}', 'Console maximum'))
    if code > 2100000000 or maximum > 2100000000 or code <= maximum:
        raise ValueError('Retained AAB code must exceed the human-attested Console maximum; build a new AAB if needed')
    return {
        'source_run_id': literal(env.get('SOURCE_RUN_ID'), r'[1-9][0-9]{0,19}', 'source run ID'),
        'artifact_id': literal(env.get('SOURCE_ARTIFACT_ID'), r'[1-9][0-9]{0,19}', 'source artifact ID'),
        'aab_sha256': literal(env.get('EXPECTED_AAB_SHA256'), r'[0-9a-f]{64}', 'AAB SHA256'),
        'upload_key_sha256': literal(env.get('EXPECTED_UPLOAD_KEY_SHA256'), r'[0-9a-f]{64}', 'upload certificate SHA256'),
        'version_code': code, 'console_max_version_code': maximum,
        'track': 'internal', 'status': 'draft',
    }


def validate_source(request, run, artifact, jobs):
    sha = literal(run.get('head_sha'), r'[0-9a-f]{40}', 'source SHA')
    required = {'head_branch': 'production', 'event': 'workflow_dispatch',
                'path': '.github/workflows/google-play.yml',
                'status': 'completed', 'conclusion': 'success'}
    repository_id = run.get('repository', {}).get('id')
    if type(repository_id) is not int or repository_id < 1:
        raise ValueError('Missing source repository numeric identity')
    if (str(run.get('id')) != request['source_run_id'] or
            any(run.get(key) != value for key, value in required.items()) or
            run.get('repository', {}).get('full_name') != REPOSITORY or
            run.get('head_repository', {}).get('full_name') != REPOSITORY or
            run.get('repository', {}).get('id') != run.get('head_repository', {}).get('id')):
        raise ValueError('Source must be a successful production signed-build dispatch in this repository')
    number, attempt = run.get('run_number'), run.get('run_attempt')
    if any(type(value) is not int or value < 1 for value in [number, attempt]):
        raise ValueError('Missing source run attempt provenance')
    origin = artifact.get('workflow_run', {})
    if (str(artifact.get('id')) != request['artifact_id'] or artifact.get('expired') is not False or
            artifact.get('name') != f'listenup-play-{sha}-{number}-{attempt}' or
            str(origin.get('id')) != request['source_run_id'] or origin.get('head_sha') != sha or
            origin.get('head_repository_id') != run['repository'].get('id')):
        raise ValueError('Artifact does not belong to the exact successful source build attempt')
    entries = jobs.get('jobs')
    if not isinstance(entries, list) or jobs.get('total_count') != len(entries):
        raise ValueError('Incomplete source-job inventory')
    builds = [job for job in entries if job.get('name') == 'build']
    if (len(builds) != 1 or builds[0].get('conclusion') != 'success' or
            builds[0].get('status') != 'completed' or str(builds[0].get('run_id')) != request['source_run_id']):
        raise ValueError('Successful signed build job evidence is required')
    return sha


def verify_artifact(directory, request, source_sha, *, with_receipt=False):
    names = {'listenup.aab', 'release.json', 'SHA256SUMS'}
    if with_receipt:
        names.add('approval-receipt.json')
    if {path.name for path in directory.iterdir()} != names:
        raise ValueError('Unexpected retained artifact file inventory')
    if any(not (directory / name).is_file() or (directory / name).is_symlink() for name in names):
        raise ValueError('Artifact files must be regular and not symlinks')
    if ((directory / 'release.json').stat().st_size > 16384 or
            (directory / 'SHA256SUMS').stat().st_size > 256 or
            not 0 < (directory / 'listenup.aab').stat().st_size <= 512 * 1024 * 1024):
        raise ValueError('Retained artifact exceeds bounded validation sizes')
    digest = request['aab_sha256']
    if (directory / 'SHA256SUMS').read_text() != f'{digest}  listenup.aab\n':
        raise ValueError('Artifact checksum manifest does not match the selected AAB')
    if file_hash(directory / 'listenup.aab') != digest:
        raise ValueError('Retained AAB checksum mismatch')
    metadata = json.loads((directory / 'release.json').read_text())
    if (metadata.get('sha') != source_sha or type(metadata.get('versionCode')) is not int or
            metadata.get('versionCode') != request['version_code'] or
            type(metadata.get('targetSdkVersion')) is not int or metadata.get('targetSdkVersion') < 36 or
            metadata.get('uploadKeySha256') != request['upload_key_sha256']):
        raise ValueError('Retained AAB identity/target/signer does not match the selected source and code')
    literal(metadata.get('version'), r'(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(\.(0|[1-9][0-9]*))?', 'display version')
    return {key: metadata[key] for key in ['sha', 'version', 'versionCode', 'targetSdkVersion', 'uploadKeySha256']}


def request_context(env):
    return {
        'workflow_sha': literal(env.get('GITHUB_SHA'), r'[0-9a-f]{40}', 'request workflow SHA'),
        'run_id': literal(env.get('GITHUB_RUN_ID'), r'[1-9][0-9]{0,19}', 'request run ID'),
        'attempt': literal(env.get('GITHUB_RUN_ATTEMPT'), r'[1-9][0-9]{0,9}', 'request attempt'),
    }


def validate_receipt(data, expected_digest, request, env):
    literal(expected_digest, r'[0-9a-f]{64}', 'approval receipt SHA256')
    if len(data) > 65536 or hashlib.sha256(data).hexdigest() != expected_digest:
        raise ValueError('Approval receipt checksum mismatch')
    receipt = json.loads(data)
    if (receipt.get('request') != request or
            any(receipt.get(key) != value for key, value in request_context(env).items())):
        raise ValueError('Approval receipt does not match this exact request and attempt; do not retry an upload blindly')
    literal(receipt.get('source_sha'), r'[0-9a-f]{40}', 'receipt source SHA')
    return receipt


def require_publish_enabled(value):
    if value != 'true':
        raise ValueError('PLAY_UPLOAD_ENABLED is not true; readiness remains disabled and no Play write is authorized')


def command(argv):
    result = subprocess.run(argv, text=True, capture_output=True, timeout=120,
                            env={**os.environ, 'LC_ALL': 'C'})
    if result.returncode:
        # Commands never receive publisher/signing credentials; do not dump env or upstream response bodies.
        raise RuntimeError(f'Validation command {Path(argv[0]).name} failed (exit {result.returncode})')
    if len(result.stdout) > 2_000_000:
        raise ValueError('Oversized validation output')
    return result.stdout


def github_json(path):
    return json.loads(command(['gh', 'api', f'repos/{REPOSITORY}/{path}']))


def inspect_bundle(directory, jar, request, metadata):
    if file_hash(jar) != BUNDLETOOL_SHA256:
        raise ValueError('Pinned bundletool checksum mismatch')
    bundle = directory / 'listenup.aab'
    with zipfile.ZipFile(bundle) as archive:
        entries = archive.infolist()
        if len({entry.filename for entry in entries}) != len(entries):
            raise ValueError('Duplicate bundle ZIP entry names are forbidden')
        if len(entries) > 50000 or sum(entry.file_size for entry in entries) > 2 * 1024**3:
            raise ValueError('Bundle archive exceeds bounded inspection limits')
        signers = [entry.filename for entry in entries if re.fullmatch(r'META-INF/[^/]+\.(RSA|DSA|EC)', entry.filename, re.I)]
        if len(signers) != 1:
            raise ValueError('Expected exactly one retained bundle signer')
    public = command(['keytool', '-printcert', '-rfc', '-jarfile', str(bundle)])
    certificates = re.findall(r'-----BEGIN CERTIFICATE-----.*?-----END CERTIFICATE-----', public, re.S)
    if not certificates or hashlib.sha256(ssl.PEM_cert_to_DER_cert(certificates[0])).hexdigest() != request['upload_key_sha256']:
        raise ValueError('Actual AAB signer does not match the selected Play upload certificate')
    # Trust ONLY the independently selected public certificate; no private key/signing material is used.
    with tempfile.TemporaryDirectory(prefix='play-public-cert-', dir=os.environ.get('RUNNER_TEMP') or os.environ.get('TMPDIR')) as tmp:
        cert = Path(tmp) / 'cert.pem'
        trust = Path(tmp) / 'public-trust.jks'
        cert.write_text(certificates[0] + '\n')
        command(['keytool', '-importcert', '-noprompt', '-alias', 'expected-upload-cert',
                 '-file', str(cert), '-keystore', str(trust), '-storepass', 'public-certificate-only'])
        verified = command(['jarsigner', '-verify', '-strict', '-keystore', str(trust),
                            '-storepass', 'public-certificate-only', str(bundle)])
        if 'jar verified.' not in verified:
            raise ValueError('Retained bundle signature is not verified')
    command(['java', '-jar', str(jar), 'validate', '--bundle=' + str(bundle)])
    xml = command(['java', '-jar', str(jar), 'dump', 'manifest', '--bundle=' + str(bundle), '--module=base'])
    spec = importlib.util.spec_from_file_location('retained_manifest_policy', Path(__file__).with_name('verify-play-bundle.py'))
    assert spec is not None and spec.loader is not None
    manifest_policy = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(manifest_policy)
    actual_target = manifest_policy.check_manifest(xml, request['version_code'], metadata['version'], True)
    if actual_target != metadata['targetSdkVersion']:
        raise ValueError('Actual bundle target SDK does not match retained metadata')


def write_outputs(values, env):
    with Path(env['GITHUB_OUTPUT']).open('a') as output:
        for key, value in values.items():
            output.write(f'{key}={value}\n')


def main(argv=None, env=None):
    env = os.environ if env is None else env
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['source', 'prepare', 'approved'])
    parser.add_argument('--state', type=Path, default=Path('approval-state'))
    parser.add_argument('--artifact', type=Path, default=Path('play-artifact'))
    parser.add_argument('--bundletool', type=Path)
    args = parser.parse_args(argv)
    request = validate_request(env)
    context = request_context(env)
    if args.phase == 'source':
        run_id, artifact_id = request['source_run_id'], request['artifact_id']
        sha = validate_source(request, github_json(f'actions/runs/{run_id}'),
                              github_json(f'actions/artifacts/{artifact_id}'),
                              github_json(f'actions/runs/{run_id}/jobs?per_page=100'))
        comparison = github_json(f'compare/{sha}...{context["workflow_sha"]}')
        if (comparison.get('status') not in ['ahead', 'identical'] or
                comparison.get('base_commit', {}).get('sha') != sha or
                comparison.get('merge_base_commit', {}).get('sha') != sha):
            raise ValueError('Source build must be an ancestor of the approved production workflow source')
        args.state.mkdir(parents=True, exist_ok=False)
        (args.state / 'source.json').write_text(json.dumps({**context, 'request': request, 'source_sha': sha}, sort_keys=True) + '\n')
        write_outputs({'source_run_id': run_id, 'artifact_id': artifact_id, 'source_sha': sha}, env)
        return
    if not args.bundletool:
        raise ValueError('Checksum-pinned bundletool is required for retained bundle inspection')
    if args.phase == 'prepare':
        state = json.loads((args.state / 'source.json').read_text())
        if state.get('request') != request or any(state.get(key) != value for key, value in context.items()):
            raise ValueError('Source approval state changed during preparation')
        metadata = verify_artifact(args.artifact, request, state['source_sha'])
        inspect_bundle(args.artifact, args.bundletool, request, metadata)
        receipt = {**state, 'metadata': metadata}
        path = args.artifact / 'approval-receipt.json'
        path.write_text(json.dumps(receipt, sort_keys=True, indent=2) + '\n')
        artifact_name = f'listenup-upload-request-{context["run_id"]}-{context["attempt"]}'
        write_outputs({'artifact': artifact_name, 'receipt_sha256': file_hash(path),
                       'aab_sha256': request['aab_sha256'], 'version': metadata['version'],
                       'version_code': request['version_code'], 'source_sha': state['source_sha']}, env)
        with Path(env['GITHUB_STEP_SUMMARY']).open('a') as summary:
            summary.write(f'### Request internal draft upload approval\n'
                          f'- Artifact source run: {request["source_run_id"]}; artifact ID: {request["artifact_id"]}\n'
                          f'- Source SHA: `{state["source_sha"]}`\n'
                          f'- ListenUp **{metadata["version"]}**, embedded versionCode **{request["version_code"]}**, target API {metadata["targetSdkVersion"]}\n'
                          f'- Exact AAB SHA256: `{request["aab_sha256"]}`\n'
                          f'- Selected upload certificate SHA256: `{request["upload_key_sha256"]}`\n'
                          f'- Human-attested Console maximum: {request["console_max_version_code"]} (not independently queried)\n'
                          '- Destination is fixed: **internal / draft**, no tester or public rollout.\n'
                          '- No rebuild or Play API write has occurred. Review the protected google-play deployment to authorize upload.\n'
                          '- Approval cannot override a disabled PLAY_UPLOAD_ENABLED readiness switch.\n')
    else:
        require_publish_enabled(env.get('PLAY_UPLOAD_ENABLED'))
        path = args.artifact / 'approval-receipt.json'
        if path.is_symlink() or path.stat().st_size > 65536:
            raise ValueError('Invalid approval receipt file')
        receipt = validate_receipt(path.read_bytes(), env.get('EXPECTED_RECEIPT_SHA256'), request, env)
        metadata = verify_artifact(args.artifact, request, receipt['source_sha'], with_receipt=True)
        if metadata != receipt.get('metadata'):
            raise ValueError('Retained metadata changed after approval preparation')
        inspect_bundle(args.artifact, args.bundletool, request, metadata)
        write_outputs({'aab_sha256': request['aab_sha256'], 'version_code': request['version_code']}, env)
        print('Exact approved internal draft artifact reverified; publisher step is separate')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, KeyError, TypeError, subprocess.SubprocessError, zipfile.BadZipFile) as error:
        print(f'Upload approval validation failed: {error}', file=sys.stderr)
        sys.exit(1)
