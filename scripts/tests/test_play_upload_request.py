"""Upload-only request policy tests; generated inputs, no publisher/network writes."""
import importlib.util
import hashlib
import json
import tempfile
import zipfile
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('upload_request', ROOT / 'scripts/play-upload-request.py')
assert SPEC is not None and SPEC.loader is not None
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)


def request_env(**changes):
    return {
        'GITHUB_EVENT_NAME': 'workflow_dispatch',
        'GITHUB_REF': 'refs/heads/production',
        'GITHUB_REPOSITORY': 'reallyenglish-global/listenup-rn',
        'SOURCE_RUN_ID': '123', 'SOURCE_ARTIFACT_ID': '456',
        'EXPECTED_AAB_SHA256': 'a' * 64, 'EXPECTED_VERSION_CODE': '3',
        'EXPECTED_UPLOAD_KEY_SHA256': 'b' * 64,
        'CONSOLE_MAX_VERSION_CODE': '2', 'REQUEST_INTERNAL_DRAFT': 'true',
        **changes,
    }


def source_fixture():
    sha = 'c' * 40
    run = {'id': 123, 'repository': {'full_name': policy.REPOSITORY, 'id': 1},
           'head_repository': {'full_name': policy.REPOSITORY, 'id': 1},
           'head_sha': sha, 'head_branch': 'production', 'event': 'workflow_dispatch',
           'path': '.github/workflows/google-play.yml', 'status': 'completed',
           'conclusion': 'success', 'run_number': 3, 'run_attempt': 1}
    artifact = {'id': 456, 'expired': False, 'name': f'listenup-play-{sha}-3-1',
                'workflow_run': {'id': 123, 'head_sha': sha, 'head_repository_id': 1}}
    jobs = {'total_count': 1, 'jobs': [{'run_id': 123, 'name': 'build',
                                      'status': 'completed', 'conclusion': 'success'}]}
    return run, artifact, jobs


class ReceiptPolicyTests(unittest.TestCase):
    def setUp(self):
        self.env = {**request_env(), 'GITHUB_SHA': 'e' * 40, 'GITHUB_RUN_ID': '789', 'GITHUB_RUN_ATTEMPT': '1'}
        self.request = policy.validate_request(self.env)
        self.receipt = {'request': self.request, 'source_sha': 'c' * 40,
                        'workflow_sha': 'e' * 40, 'run_id': '789', 'attempt': '1',
                        'metadata': {'version': '2026.1'}}

    def verify(self, **env_changes):
        data = (json.dumps(self.receipt, sort_keys=True) + '\n').encode()
        digest = hashlib.sha256(data).hexdigest()
        return policy.validate_receipt(data, digest, self.request, {**self.env, **env_changes})

    def test_approved_job_rechecks_exact_receipt_and_request_context(self):
        self.assertEqual(self.verify()['source_sha'], 'c' * 40)
        for changes in [{'GITHUB_SHA': 'f' * 40}, {'GITHUB_RUN_ID': '790'}, {'GITHUB_RUN_ATTEMPT': '2'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.verify(**changes)
        self.receipt['request'] = {**self.request, 'version_code': 4}
        with self.assertRaises(ValueError):
            self.verify()

    def test_changed_receipt_bytes_and_disabled_publishing_are_rejected(self):
        with self.assertRaises(ValueError):
            policy.validate_receipt(b'{}', 'a' * 64, self.request, self.env)
        for value in ['', 'false', 'TRUE', True]:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'PLAY_UPLOAD_ENABLED'):
                policy.require_publish_enabled(value)
        policy.require_publish_enabled('true')


class ArtifactPolicyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='listenup-artifact-policy-')
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.aab = self.directory / 'listenup.aab'
        self.aab.write_bytes(b'Explicit hash fixture, not a real Android bundle')
        digest = hashlib.sha256(self.aab.read_bytes()).hexdigest()
        self.request = policy.validate_request(request_env(EXPECTED_AAB_SHA256=digest))
        self.metadata = {'sha': 'c' * 40, 'version': '2026.1', 'versionCode': 3,
                         'targetSdkVersion': 36, 'uploadKeySha256': 'b' * 64,
                         'track': 'internal', 'status': 'draft'}
        (self.directory / 'SHA256SUMS').write_text(f'{digest}  listenup.aab\n')
        self.save_metadata()

    def save_metadata(self):
        (self.directory / 'release.json').write_text(json.dumps(self.metadata))

    def test_cli_phases_bind_receipt_and_stop_when_readiness_is_disabled(self):
        with tempfile.TemporaryDirectory(prefix='listenup-request-state-') as tmp:
            state = Path(tmp) / 'source'
            output = Path(tmp) / 'outputs'
            env = {**request_env(EXPECTED_AAB_SHA256=self.request['aab_sha256']),
                   'GITHUB_SHA': 'e' * 40, 'GITHUB_RUN_ID': '789', 'GITHUB_RUN_ATTEMPT': '1',
                   'GITHUB_OUTPUT': str(output), 'GITHUB_STEP_SUMMARY': str(Path(tmp) / 'summary')}
            run, artifact, jobs = source_fixture()
            ancestry = {'status': 'ahead', 'base_commit': {'sha': 'c' * 40},
                        'merge_base_commit': {'sha': 'c' * 40}}
            # Explicit command/HTTP fixtures exercise wiring; this is NOT signed-AAB or Play evidence.
            with patch.object(policy, 'github_json', side_effect=[run, artifact, jobs, ancestry]), \
                 patch.object(policy, 'inspect_bundle') as inspect:
                policy.main(['source', '--state', str(state)], env)
                args = ['--state', str(state), '--artifact', str(self.directory), '--bundletool', str(Path(tmp) / 'fixture.jar')]
                policy.main(['prepare', *args], env)
                receipt = self.directory / 'approval-receipt.json'
                approved_env = {**env, 'EXPECTED_RECEIPT_SHA256': policy.file_hash(receipt),
                                'PLAY_UPLOAD_ENABLED': 'false'}
                with self.assertRaisesRegex(ValueError, 'PLAY_UPLOAD_ENABLED'):
                    policy.main(['approved', *args], approved_env)
                self.assertEqual(inspect.call_count, 1)
                approved_env['PLAY_UPLOAD_ENABLED'] = 'true'
                policy.main(['approved', *args], approved_env)
                self.assertEqual(inspect.call_count, 2)
                self.aab.write_bytes(b'changed after preparation')
                with self.assertRaisesRegex(ValueError, 'checksum'):
                    policy.main(['approved', *args], approved_env)
                self.assertEqual(inspect.call_count, 2)
                self.assertIn('receipt_sha256=', output.read_text())

    def test_duplicate_zip_entries_are_rejected_before_external_inspection(self):
        with zipfile.ZipFile(self.aab, 'w') as archive:
            archive.writestr('META-INF/FIXTURE.RSA', 'explicit signature fixture')
            archive.writestr('base/manifest/AndroidManifest.xml', 'first fixture')
            archive.writestr('base/manifest/AndroidManifest.xml', 'duplicate fixture')
        with patch.object(policy, 'file_hash', return_value=policy.BUNDLETOOL_SHA256), \
             patch.object(policy, 'command', return_value='') as external:
            with self.assertRaisesRegex(ValueError, 'Duplicate'):
                policy.inspect_bundle(self.directory, self.directory / 'fixture.jar', self.request, self.metadata)
            external.assert_not_called()

    def test_tampered_bundle_is_rejected(self):
        self.aab.write_bytes(b'tampered')
        with self.assertRaisesRegex(ValueError, 'checksum'):
            policy.verify_artifact(self.directory, self.request, 'c' * 40)

    def test_mismatched_metadata_cannot_relabel_an_existing_aab(self):
        for field, value in [('sha', 'd' * 40), ('versionCode', 4), ('targetSdkVersion', 35),
                             ('uploadKeySha256', 'e' * 64), ('version', '2026.01')]:
            old = self.metadata[field]
            self.metadata[field] = value
            self.save_metadata()
            with self.subTest(field=field), self.assertRaises(ValueError):
                policy.verify_artifact(self.directory, self.request, 'c' * 40)
            self.metadata[field] = old
        self.save_metadata()

    def test_extra_files_and_symlinks_are_rejected(self):
        extra = self.directory / 'unexpected.key'
        extra.write_text('explicit fixture')
        with self.assertRaises(ValueError):
            policy.verify_artifact(self.directory, self.request, 'c' * 40)
        extra.unlink()
        checksum = self.directory / 'SHA256SUMS'
        original = checksum.read_text()
        checksum.unlink()
        checksum.symlink_to(self.directory / 'release.json')
        with self.assertRaises(ValueError):
            policy.verify_artifact(self.directory, self.request, 'c' * 40)
        checksum.unlink()
        checksum.write_text(original)

    def test_checksum_manifest_cannot_select_another_path(self):
        digest = self.request['aab_sha256']
        (self.directory / 'SHA256SUMS').write_text(f'{digest}  ../listenup.aab\n')
        with self.assertRaises(ValueError):
            policy.verify_artifact(self.directory, self.request, 'c' * 40)

    def test_exact_hash_metadata_and_version_are_selected_without_rebuilding(self):
        result = policy.verify_artifact(self.directory, self.request, 'c' * 40)
        self.assertEqual(result['version'], '2026.1')
        self.assertEqual(result['versionCode'], 3)


class SourceRunPolicyTests(unittest.TestCase):
    def test_missing_repository_ids_are_not_an_identity_match(self):
        run, artifact, jobs = source_fixture()
        run['repository'].pop('id')
        run['head_repository'].pop('id')
        artifact['workflow_run'].pop('head_repository_id')
        with self.assertRaises(ValueError):
            policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)
    def test_wrong_source_workflow_ref_result_or_repository_is_rejected(self):
        for key, value in [('id', 124), ('head_branch', 'main'), ('event', 'pull_request'),
                           ('path', '.github/workflows/test.yml'), ('conclusion', 'failure')]:
            run, artifact, jobs = source_fixture()
            run[key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)
        run, artifact, jobs = source_fixture()
        run['head_repository']['full_name'] = 'other/listenup-rn'
        with self.assertRaises(ValueError):
            policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)

    def test_wrong_artifact_or_incomplete_build_evidence_is_rejected(self):
        for field, value in [('id', 999), ('expired', True), ('name', 'copied-artifact')]:
            run, artifact, jobs = source_fixture()
            artifact[field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)
        run, artifact, jobs = source_fixture()
        artifact['workflow_run']['head_sha'] = 'd' * 40
        with self.assertRaises(ValueError):
            policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)
        for change in [{'total_count': 2}, {'jobs': []},
                       {'jobs': [{'run_id': 123, 'name': 'build', 'status': 'completed', 'conclusion': 'failure'}]}]:
            run, artifact, jobs = source_fixture()
            jobs.update(change)
            with self.subTest(change=change), self.assertRaises(ValueError):
                policy.validate_source(policy.validate_request(request_env()), run, artifact, jobs)

    def test_retained_production_build_has_bound_source_identity(self):
        request = policy.validate_request(request_env())
        self.assertEqual(policy.validate_source(request, *source_fixture()), 'c' * 40)


class RequestPolicyTests(unittest.TestCase):
    def test_requires_manual_production_in_the_product_repository(self):
        for change in [{'GITHUB_EVENT_NAME': 'pull_request'}, {'GITHUB_REF': 'refs/heads/main'},
                       {'GITHUB_REF': 'refs/tags/production'}, {'GITHUB_REPOSITORY': 'other/listenup-rn'}]:
            with self.subTest(change=change), self.assertRaisesRegex(ValueError, 'manual production'):
                policy.validate_request(request_env(**change))

    def test_requires_explicit_internal_draft_request(self):
        for value in ['', 'false', 'TRUE', True]:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, 'Explicit internal draft'):
                policy.validate_request(request_env(REQUEST_INTERNAL_DRAFT=value))

    def test_identifiers_and_hashes_are_not_repaired(self):
        for key, value in [('SOURCE_RUN_ID', ' 123'), ('SOURCE_ARTIFACT_ID', '0456'),
                           ('EXPECTED_AAB_SHA256', 'A' * 64), ('EXPECTED_UPLOAD_KEY_SHA256', 'b' * 63)]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                policy.validate_request(request_env(**{key: value}))

    def test_code_must_be_greater_than_attested_console_maximum(self):
        for code, maximum in [('3', '3'), ('3', '4'), ('03', '2'), ('2100000001', '0'), ('3', '')]:
            with self.subTest(code=code, maximum=maximum), self.assertRaises(ValueError):
                policy.validate_request(request_env(EXPECTED_VERSION_CODE=code, CONSOLE_MAX_VERSION_CODE=maximum))
        self.assertEqual(policy.validate_request(request_env(CONSOLE_MAX_VERSION_CODE='0'))['version_code'], 3)

    def test_explicit_request_is_always_internal_draft(self):
        result = policy.validate_request(request_env(PLAY_TRACK='production', PLAY_STATUS='completed'))
        self.assertEqual((result['track'], result['status']), ('internal', 'draft'))
        self.assertEqual(result['version_code'], 3)
        self.assertEqual(result['source_run_id'], '123')
        self.assertEqual(result['artifact_id'], '456')


if __name__ == '__main__':
    unittest.main()
