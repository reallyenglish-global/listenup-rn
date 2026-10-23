"""Regression checks for the credential-free workflow wiring, not Play results."""
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]


class PlayWorkflowTests(unittest.TestCase):
    def test_main_manual_gate_and_no_automatic_release_trigger(self):
        workflow = (ROOT / '.github/workflows/google-play.yml').read_text()
        self.assertNotIn('  push:', workflow)
        self.assertNotIn('  pull_request:', workflow)
        self.assertIn("if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'", workflow)
        self.assertIn("if: github.ref == 'refs/heads/main' && needs.build.outputs.upload == 'true'", workflow)
        self.assertNotIn('refs/heads/ci/', workflow)
        self.assertIn('cancel-in-progress: false', workflow)

    def test_selected_destination_flows_to_upload_and_readback(self):
        workflow = (ROOT / '.github/workflows/google-play.yml').read_text()
        for field in ('track', 'status'):
            self.assertIn(f'      {field}: ${{{{ steps.release.outputs.{field} }}}}', workflow)
            self.assertIn(f'          {field}: ${{{{ needs.build.outputs.{field} }}}}', workflow)
            self.assertIn(f'          PLAY_{field.upper()}: ${{{{ inputs.{field} }}}}', workflow)
            self.assertIn(f'          PLAY_{field.upper()}: ${{{{ needs.build.outputs.{field} }}}}', workflow)
        self.assertIn('PLAY_CONFIRM_RELEASE: ${{ inputs.confirm_release }}', workflow)
        self.assertIn("changesNotSentForReview: ${{ needs.build.outputs.status == 'draft' }}", workflow)

    def test_reusable_preview_caller_never_requests_upload(self):
        workflow = (ROOT / '.github/workflows/android-apk.yml').read_text()
        caller = workflow.split('  signed-bundle:', 1)[1].split('  build-preview-apk:', 1)[0]
        self.assertIn('uses: ./.github/workflows/google-play.yml', caller)
        self.assertIn('upload: false', caller)


if __name__ == '__main__':
    unittest.main()
