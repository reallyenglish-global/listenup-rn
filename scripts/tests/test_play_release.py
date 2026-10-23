import importlib.util
from pathlib import Path
import unittest


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).parents[1] / path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


bundle = load('bundle', 'verify-play-bundle.py')
upload = load('upload', 'verify-play-upload.py')


def manifest(package='com.reallyenglish.listenup', code='1001001', version='1.0.0', target='36', extra=''):
    return f'<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{package}" android:versionCode="{code}" android:versionName="{version}"><uses-sdk android:targetSdkVersion="{target}"/><application {extra}/></manifest>'


class BundlePolicyTests(unittest.TestCase):
    def test_release_identity_and_target(self):
        self.assertEqual(bundle.check_manifest(manifest(), 1001001, '1.0.0', True), 36)

    def test_old_sdk_allowed_only_for_local_manual_build(self):
        self.assertEqual(bundle.check_manifest(manifest(target='34'), 1001001, '1.0.0', False), 34)
        with self.assertRaisesRegex(ValueError, 'targetSdkVersion'):
            bundle.check_manifest(manifest(target='34'), 1001001, '1.0.0', True)

    def test_foreign_package_and_wrong_versions(self):
        for changes in [{'package': 'com.other.app'}, {'code': '1'}, {'version': '1.0.1'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                bundle.check_manifest(manifest(**changes), 1001001, '1.0.0', True)

    def test_debug_and_test_only_denied(self):
        for extra in ['android:debuggable="true"', 'android:testOnly="true"']:
            with self.subTest(extra=extra), self.assertRaises(ValueError):
                bundle.check_manifest(manifest(extra=extra), 1001001, '1.0.0', True)

    def test_missing_application_and_target_denied(self):
        for xml in [manifest().replace('<application />', ''), manifest().replace('android:targetSdkVersion="36"', '')]:
            with self.assertRaises(ValueError):
                bundle.check_manifest(xml, 1001001, '1.0.0', True)


class PlayReadbackTests(unittest.TestCase):
    def test_exact_bundle_hash_required(self):
        sha = 'a' * 64
        upload.check_bundle({'bundles': [{'versionCode': 1001001, 'sha256': sha}]}, '1001001', sha)
        upload.check_bundle({'bundles': [{'versionCode': 1001001, 'sha256': sha.upper()}]}, '1001001', sha)
        for bundles in [[], [{'versionCode': 1, 'sha256': sha}], [{'versionCode': 1001001, 'sha256': 'b' * 64}], [{'versionCode': 1001001, 'sha256': sha}] * 2]:
            with self.subTest(bundles=bundles), self.assertRaises(ValueError):
                upload.check_bundle({'bundles': bundles}, '1001001', sha)

    def test_exact_internal_draft_required(self):
        upload.check_track({'track': 'internal', 'releases': [{'status': 'draft', 'versionCodes': ['1001001']}]}, '1001001')

    def test_each_selected_track_and_status_is_verified(self):
        for track in ('internal', 'production'):
            for status in ('draft', 'completed'):
                response = {'track': track, 'releases': [{'status': status, 'versionCodes': ['1001001']}]}
                upload.check_track(response, '1001001', track, status)
                with self.assertRaises(ValueError):
                    upload.check_track(response, '1001001', 'production' if track == 'internal' else 'internal', status)
                with self.assertRaises(ValueError):
                    upload.check_track(response, '1001001', track, 'draft' if status == 'completed' else 'completed')
                with self.assertRaises(ValueError):
                    upload.check_track(response, '1', track, status)
        with self.assertRaises(ValueError):
            upload.check_track({}, '1001001', '../production', 'completed')

    def test_wrong_track_status_version_or_missing_release_rejected(self):
        for track in [
            {'track': 'production', 'releases': [{'status': 'draft', 'versionCodes': ['1001001']}]},
            {'track': 'internal', 'releases': [{'status': 'completed', 'versionCodes': ['1001001']}]},
            {'track': 'internal', 'releases': [{'status': 'draft', 'versionCodes': ['1']}]},
            {'track': 'internal', 'releases': []},
        ]:
            with self.subTest(track=track), self.assertRaises(ValueError):
                upload.check_track(track, '1001001')


if __name__ == '__main__':
    unittest.main()
