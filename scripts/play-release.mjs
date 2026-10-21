import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseMetadata(env, config) {
  const version = config.expo.version;
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Set an X.Y.Z app.json version first');
  if (config.expo.android?.package !== 'com.reallyenglish.listenup') throw new Error('Unexpected Android package');
  if (env.GITHUB_EVENT_NAME === 'push') {
    if (env.GITHUB_REF !== `refs/tags/v${version}`) throw new Error('Release tag must exactly match app.json version');
  } else if (env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || env.GITHUB_REF !== 'refs/heads/main') {
    throw new Error('Manual releases must run from main');
  }
  const integer = (value, name) => {
    if (!/^[1-9]\d*$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) throw new Error(`Invalid ${name}`);
    return Number(value);
  };
  const base = integer(env.PLAY_VERSION_CODE_BASE || '1000000', 'version-code base');
  const run = integer(env.GITHUB_RUN_NUMBER, 'run number');
  const attempt = integer(env.GITHUB_RUN_ATTEMPT, 'run attempt');
  if (attempt > 99) throw new Error('Too many attempts; start a new run');
  const code = base + run * 100 + attempt;
  if (!Number.isSafeInteger(code) || code > 2100000000) throw new Error('Version code exceeds Play limit');
  const requested = env.GITHUB_EVENT_NAME === 'push' || env.PLAY_UPLOAD_REQUESTED === 'true';
  if (requested && env.PLAY_UPLOAD_ENABLED !== 'true') throw new Error('Enable PLAY_UPLOAD_ENABLED only after first-upload/API/SDK setup; manual build-only remains available');
  return { version, versionCode: code, upload: requested };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = releaseMetadata(process.env, JSON.parse(readFileSync('app.json', 'utf8')));
  appendFileSync(process.env.GITHUB_ENV, `PLAY_VERSION_CODE=${result.versionCode}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${result.version}\nversion_code=${result.versionCode}\nupload=${result.upload}\n`);
  console.log(`ListenUp ${result.version}, versionCode ${result.versionCode}, internal draft upload=${result.upload}`);
}
