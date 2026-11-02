"""Upload-only workflow wiring contracts; no Play/signing credentials."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]
PATH = ROOT / '.github/workflows/google-play-upload.yml'


class UploadOnlyWorkflowTests(unittest.TestCase):
    def test_manual_production_only_and_shared_release_lock(self):
        text = PATH.read_text()
        self.assertIn('  workflow_dispatch:', text)
        self.assertNotIn('  push:', text)
        self.assertNotIn('  pull_request:', text)
        self.assertIn("github.ref == 'refs/heads/production'", text)
        self.assertIn('group: listenup-google-play', text)
        self.assertIn('cancel-in-progress: false', text)
        self.assertIn('actions: read', text)

    def test_no_rebuild_no_signing_key_no_rollout_selector(self):
        text = PATH.read_text()
        for forbidden in ['gradlew', 'expo prebuild', 'pnpm install', 'PLAY_KEYSTORE',
                          'PLAY_STORE_PASSWORD', 'PLAY_KEY_PASSWORD', 'confirm_release:',
                          'options: [internal, production]', 'status: completed']:
            self.assertNotIn(forbidden, text)
        self.assertIn('          track: internal', text)
        self.assertIn('          status: draft', text)
        self.assertIn('          changesNotSentForReview: true', text)
        for ref in re.findall(r'uses: (\S+)', text):
            self.assertRegex(ref, r'^[\w/-]+@[0-9a-f]{40}$')

    def test_preparation_has_no_publisher_secret_or_approval_environment(self):
        text = PATH.read_text()
        prepare = text.split('  prepare:', 1)[1].split('  upload:', 1)[0]
        self.assertNotIn('environment:', prepare)
        self.assertNotIn('secrets.', prepare)
        self.assertIn('scripts/play-upload-request.py source', prepare)
        self.assertIn('scripts/play-upload-request.py prepare', prepare)
        self.assertIn('artifact-ids: ${{ steps.source.outputs.artifact_id }}', prepare)
        self.assertIn('run-id: ${{ steps.source.outputs.source_run_id }}', prepare)
        self.assertIn('if-no-files-found: error', prepare)

    def test_upload_still_requires_google_play_approval_and_readiness_switch(self):
        text = PATH.read_text()
        upload = text.split('  upload:', 1)[1]
        self.assertIn('needs: prepare', upload)
        self.assertIn('name: google-play', upload)
        self.assertIn('PLAY_UPLOAD_ENABLED: ${{ vars.PLAY_UPLOAD_ENABLED }}', upload)
        self.assertIn('scripts/play-upload-request.py approved', upload)
        self.assertIn('EXPECTED_RECEIPT_SHA256: ${{ needs.prepare.outputs.receipt_sha256 }}', upload)
        self.assertLess(upload.index('scripts/play-upload-request.py approved'),
                        upload.index('uses: r0adkll/upload-google-play@'))
        self.assertIn('run: python3 scripts/verify-play-upload.py', upload)
        self.assertIn('existingEditId: ${{ steps.edit.outputs.edit_id }}', upload)
        self.assertIn('run: python3 scripts/play-empty-internal-edit.py create', upload)
        self.assertLess(upload.index('scripts/play-empty-internal-edit.py create'),
                        upload.index('uses: r0adkll/upload-google-play@'))
        self.assertIn("steps.publish.outcome != 'success'", upload)
        self.assertEqual(set(re.findall(r'secrets\.([A-Z_]+)', upload)), {'PLAY_SERVICE_ACCOUNT_JSON'})


if __name__ == '__main__':
    unittest.main()
