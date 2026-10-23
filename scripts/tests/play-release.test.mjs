import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { releaseMetadata } from '../play-release.mjs';
const require = createRequire(import.meta.url);
const appConfig = require('../../app.config.js');
const config = { expo: { version: '1.0.0', android: { package: 'com.reallyenglish.listenup' } } };
const env = { GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', GITHUB_RUN_NUMBER: '10', GITHUB_RUN_ATTEMPT: '1', PLAY_VERSION_CODE: '1001001', PLAY_UPLOAD_ENABLED: 'true' };

test('main defaults to build-only internal draft', () => {
  assert.deepEqual(releaseMetadata(env, config), { version: '1.0.0', versionCode: 1001001, upload: false, track: 'internal', status: 'draft' });
});
test('manual defaults to build only on main', () => {
  assert.equal(releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', PLAY_UPLOAD_ENABLED: '' }, config).upload, false);
});
test('manual upload requires explicit input and setup switch', () => {
  assert.equal(releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', PLAY_UPLOAD_REQUESTED: 'true' }, config).upload, true);
});
test('every non-main ref is denied even for build-only', () => {
  for (const ref of ['refs/heads/ci/google-play-internal-drafts', 'refs/heads/feature', 'refs/tags/v1.0.0', 'refs/pull/1/merge']) {
    for (const upload of ['false', 'true']) {
      assert.throws(() => releaseMetadata({ ...env, GITHUB_REF: ref, PLAY_UPLOAD_REQUESTED: upload }, config), /manual dispatch on main/);
    }
  }
});
test('testing and production drafts and confirmed rollouts are explicit', () => {
  for (const track of ['internal', 'production']) {
    for (const status of ['draft', 'completed']) {
      const request = { ...env, PLAY_UPLOAD_REQUESTED: 'true', PLAY_TRACK: track, PLAY_STATUS: status };
      if (status === 'completed') assert.throws(() => releaseMetadata(request, config), /confirm_release/);
      const result = releaseMetadata({ ...request, PLAY_CONFIRM_RELEASE: 'true' }, config);
      assert.equal(result.track, track);
      assert.equal(result.status, status);
      assert.equal(result.upload, true);
    }
  }
});
test('reject arbitrary tracks and statuses', () => {
  for (const track of ['beta', '../production', 'Production']) assert.throws(() => releaseMetadata({ ...env, PLAY_TRACK: track }, config));
  for (const status of ['inProgress', 'halted', 'invalid']) assert.throws(() => releaseMetadata({ ...env, PLAY_STATUS: status }, config));
});
test('requested uploads fail before setup', () => {
  assert.throws(() => releaseMetadata({ ...env, PLAY_UPLOAD_REQUESTED: 'true', PLAY_UPLOAD_ENABLED: 'false' }, config), /Enable PLAY_UPLOAD_ENABLED/);
});
test('reject mismatched and injected tags, arbitrary refs and PR events', () => {
  for (const ref of ['refs/tags/v1.0.1', 'refs/tags/v1.0.0-rc.1', 'refs/heads/not-main', 'refs/tags/v1.0.0;echo bad']) {
    assert.throws(() => releaseMetadata({ ...env, GITHUB_REF: ref }, config));
  }
  for (const event of ['push', 'pull_request', 'schedule', 'workflow_call']) {
    assert.throws(() => releaseMetadata({ ...env, GITHUB_EVENT_NAME: event }, config), /manual dispatch on main/);
  }
  assert.throws(() => releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/feature' }, config));
});
test('reject wrong package and invalid app versions', () => {
  assert.throws(() => releaseMetadata(env, { expo: { ...config.expo, android: { package: 'another.app' } } }));
  for (const version of ['01.0.0', '1.0', '1.0.0-rc.1']) assert.throws(() => releaseMetadata(env, { expo: { ...config.expo, version } }));
});
test('an explicit code survives workflow numbering resets and reruns', () => {
  const explicit = { ...env, PLAY_VERSION_CODE: '1001002' };
  assert.equal(releaseMetadata(explicit, config).versionCode, 1001002);
  assert.equal(releaseMetadata({ ...explicit, GITHUB_RUN_NUMBER: '1', GITHUB_RUN_ATTEMPT: '2' }, config).versionCode, 1001002);
});
test('explicit version codes are required and bounded, without run-counter dependencies', () => {
  assert.equal(releaseMetadata({ ...env, PLAY_VERSION_CODE: '2100000000', GITHUB_RUN_NUMBER: undefined, GITHUB_RUN_ATTEMPT: undefined }, config).versionCode, 2100000000);
  for (const value of [undefined, '', '0', '-1', '3.5', '1e3', '010', ' 1001001 ', '2100000001', '9007199254740993']) {
    assert.throws(() => releaseMetadata({ ...env, PLAY_VERSION_CODE: value }, config), /version code/i);
  }
});
test('dynamic config preserves preview fields and rejects unsafe version codes', () => {
  const old = process.env.PLAY_VERSION_CODE;
  try {
    delete process.env.PLAY_VERSION_CODE;
    assert.equal(appConfig({ config: config.expo }), config.expo);
    process.env.PLAY_VERSION_CODE = '1001001';
    assert.deepEqual(appConfig({ config: config.expo }).android, { package: 'com.reallyenglish.listenup', versionCode: 1001001 });
    for (const value of ['0', '-1', '2100000001', '1e3', '1.2']) {
      process.env.PLAY_VERSION_CODE = value;
      assert.throws(() => appConfig({ config: config.expo }));
    }
  } finally {
    if (old === undefined) delete process.env.PLAY_VERSION_CODE;
    else process.env.PLAY_VERSION_CODE = old;
  }
});
