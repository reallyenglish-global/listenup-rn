"""Post-approval guard: create only an empty internal-track edit, never commit it."""
import re
import sys
import argparse
import importlib.util
import json
import os
from pathlib import Path


def load(name):
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), Path(__file__).with_name(name + '.py'))
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def check_empty_internal(track):
    releases = track.get('releases', [])
    if track.get('track') != 'internal' or not isinstance(releases, list) or releases:
        raise ValueError('Internal track is not empty; refusing to replace an existing draft or tester release')


def create_empty_edit(client, token):
    edit = client.json_request(client.BASE, 'POST', {}, token)['id']
    if not isinstance(edit, str) or not re.fullmatch(r'[A-Za-z0-9_-]+', edit):
        raise ValueError('Unexpected owned Play edit ID')
    try:
        check_empty_internal(client.json_request(client.BASE + '/' + edit + '/tracks/internal', token=token))
    except BaseException:
        try:
            client.json_request(client.BASE + '/' + edit, 'DELETE', token=token)
        except Exception:
            print('Warning: owned uncommitted inspection edit could not be deleted; inspect Console before retrying.', file=sys.stderr)
        raise
    return edit


def delete_owned_edit(client, token, edit):
    if not isinstance(edit, str) or not re.fullmatch(r'[A-Za-z0-9_-]+', edit):
        raise ValueError('Invalid owned Play edit ID')
    try:
        client.json_request(client.BASE + '/' + edit, 'DELETE', token=token)
    except RuntimeError:
        print('Warning: owned edit cleanup was not confirmed; it may already be committed. Inspect Console before retrying; no rollback is claimed.', file=sys.stderr)


def main(argv=None, env=None):
    env = os.environ if env is None else env
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('phase', choices=['create', 'cleanup'])
    args = parser.parse_args(argv)
    request_policy = load('play-upload-request')
    request_policy.validate_request(env)
    request_policy.request_context(env)
    request_policy.require_publish_enabled(env.get('PLAY_UPLOAD_ENABLED'))
    client = load('verify-play-upload')
    token = client.publisher_access_token(json.loads(env['PLAY_SERVICE_ACCOUNT_JSON']))
    if args.phase == 'cleanup':
        delete_owned_edit(client, token, env.get('OWNED_PLAY_EDIT_ID'))
        return
    edit = create_empty_edit(client, token)
    try:
        with Path(env['GITHUB_OUTPUT']).open('a') as output:
            output.write(f'edit_id={edit}\n')
    except BaseException:
        delete_owned_edit(client, token, edit)
        raise
    print('Owned internal-track edit is empty; only this checked edit may be passed to the publisher')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, KeyError, TypeError) as error:
        print(f'Empty-track guard stopped: {error}', file=sys.stderr)
        sys.exit(1)
