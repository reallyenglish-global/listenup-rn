import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { releaseMetadata } from '../play-release.mjs';
const require = createRequire(import.meta.url);
const appConfig = require('../../app.config.js');
const config = { expo: { version: '1.0.0', android: { package: 'com.reallyenglish.listenup' } } };
const env = { GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/tags/v1.0.0', GITHUB_RUN_NUMBER: '10', GITHUB_RUN_ATTEMPT: '1', PLAY_UPLOAD_ENABLED: 'true' };

test('matching version tag requests internal draft upload', () => {
  assert.deepEqual(releaseMetadata(env, config), { version: '1.0.0', versionCode: 1001001, upload: true });
});
test('manual defaults to build only on main', () => {
  assert.equal(releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', PLAY_UPLOAD_ENABLED: '' }, config).upload, false);
});
test('manual upload requires explicit input and setup switch', () => {
  assert.equal(releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main', PLAY_UPLOAD_REQUESTED: 'true' }, config).upload, true);
});
test('tags cannot silently skip requested uploads before setup', () => {
  assert.throws(() => releaseMetadata({ ...env, PLAY_UPLOAD_ENABLED: 'false' }, config), /Enable PLAY_UPLOAD_ENABLED/);
});
test('reject mismatched and injected tags, arbitrary refs and PR events', () => {
  for (const ref of ['refs/tags/v1.0.1', 'refs/tags/v1.0.0-rc.1', 'refs/heads/main', 'refs/tags/v1.0.0;echo bad']) {
    assert.throws(() => releaseMetadata({ ...env, GITHUB_REF: ref }, config));
  }
  assert.throws(() => releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'pull_request' }, config));
  assert.throws(() => releaseMetadata({ ...env, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/feature' }, config));
});
test('reject wrong package and invalid app versions', () => {
  assert.throws(() => releaseMetadata(env, { expo: { ...config.expo, android: { package: 'another.app' } } }));
  for (const version of ['01.0.0', '1.0', '1.0.0-rc.1']) assert.throws(() => releaseMetadata(env, { expo: { ...config.expo, version } }));
});
test('run numbers and reruns produce distinct codes; overflow is denied', () => {
  assert.equal(releaseMetadata({ ...env, GITHUB_RUN_ATTEMPT: '2' }, config).versionCode, 1001002);
  assert.equal(releaseMetadata({ ...env, GITHUB_RUN_NUMBER: '11' }, config).versionCode, 1001101);
  for (const value of ['0', '-1', '3.5', '1e3', '9007199254740993', '']) assert.throws(() => releaseMetadata({ ...env, GITHUB_RUN_NUMBER: value }, config));
  assert.throws(() => releaseMetadata({ ...env, GITHUB_RUN_ATTEMPT: '100' }, config));
  assert.throws(() => releaseMetadata({ ...env, PLAY_VERSION_CODE_BASE: '2100000000' }, config));
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
