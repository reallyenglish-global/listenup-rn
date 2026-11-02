"""No-network fixtures for the post-approval empty internal-track edit guard."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('empty_edit', ROOT / 'scripts/play-empty-internal-edit.py')
assert SPEC is not None and SPEC.loader is not None
policy = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(policy)


class EmptyInternalEditTests(unittest.TestCase):
    def test_disabled_publishing_fails_before_accessing_a_publisher_credential(self):
        env = {'GITHUB_EVENT_NAME': 'workflow_dispatch', 'GITHUB_REF': 'refs/heads/production',
               'GITHUB_REPOSITORY': 'reallyenglish-global/listenup-rn', 'GITHUB_SHA': 'e' * 40,
               'GITHUB_RUN_ID': '789', 'GITHUB_RUN_ATTEMPT': '1', 'SOURCE_RUN_ID': '123',
               'SOURCE_ARTIFACT_ID': '456', 'EXPECTED_AAB_SHA256': 'a' * 64,
               'EXPECTED_UPLOAD_KEY_SHA256': 'b' * 64, 'EXPECTED_VERSION_CODE': '3',
               'CONSOLE_MAX_VERSION_CODE': '2', 'REQUEST_INTERNAL_DRAFT': 'true',
               'PLAY_UPLOAD_ENABLED': 'false'}
        with self.assertRaisesRegex(ValueError, 'PLAY_UPLOAD_ENABLED'):
            policy.main(['create'], env)

    def test_read_failure_cleans_owned_edit_without_changing_the_error(self):
        client = Mock(BASE='https://fixture.invalid/edits')
        client.json_request.side_effect = [{'id': 'owned-edit'}, RuntimeError('explicit read fixture failure'), {}]
        with self.assertRaisesRegex(RuntimeError, 'explicit read fixture failure'):
            policy.create_empty_edit(client, 'explicit-fixture-token')
        self.assertEqual(client.json_request.call_args_list[-1].args[:2],
                         ('https://fixture.invalid/edits/owned-edit', 'DELETE'))

    def test_invalid_owned_edit_id_is_not_used_as_a_path(self):
        client = Mock(BASE='https://fixture.invalid/edits')
        client.json_request.return_value = {'id': '../another-edit'}
        with self.assertRaises(ValueError):
            policy.create_empty_edit(client, 'explicit-fixture-token')
        self.assertEqual(client.json_request.call_count, 1)

    def test_empty_internal_track_is_allowed(self):
        policy.check_empty_internal({'track': 'internal', 'releases': []})
        policy.check_empty_internal({'track': 'internal'})

    def test_existing_or_wrong_track_state_is_not_overwritten(self):
        for track in [{'track': 'production'}, {'track': 'internal', 'releases': None},
                      {'track': 'internal', 'releases': [{'status': 'draft', 'versionCodes': ['1']}]},
                      {'track': 'internal', 'releases': [{'status': 'completed', 'versionCodes': ['2']}]}]:
            with self.subTest(track=track), self.assertRaises(ValueError):
                policy.check_empty_internal(track)

    def test_same_owned_checked_edit_is_returned_without_upload_or_commit(self):
        client = Mock(BASE='https://fixture.invalid/edits')
        client.json_request.side_effect = [{'id': 'fixture-edit'}, {'track': 'internal', 'releases': []}]
        self.assertEqual(policy.create_empty_edit(client, 'explicit-fixture-token'), 'fixture-edit')
        calls = client.json_request.call_args_list
        self.assertEqual(len(calls), 2)
        self.assertEqual(calls[0].args[1], 'POST')
        self.assertEqual(calls[1].args[0], 'https://fixture.invalid/edits/fixture-edit/tracks/internal')
        self.assertNotIn('commit', str(calls))
        self.assertNotIn('bundles', str(calls))

    def test_rejected_track_deletes_only_its_uncommitted_edit(self):
        client = Mock(BASE='https://fixture.invalid/edits')
        client.json_request.side_effect = [{'id': 'owned-edit'},
                                          {'track': 'internal', 'releases': [{'status': 'completed'}]}, {}]
        with self.assertRaises(ValueError):
            policy.create_empty_edit(client, 'explicit-fixture-token')
        self.assertEqual(client.json_request.call_args_list[-1].args[:2],
                         ('https://fixture.invalid/edits/owned-edit', 'DELETE'))


if __name__ == '__main__':
    unittest.main()
