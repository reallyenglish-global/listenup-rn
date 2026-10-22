import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseMetadata(env, config) {
  const version = config.expo.version;
  const requested = env.GITHUB_EVENT_NAME === 'push' || env.PLAY_UPLOAD_REQUESTED === 'true';
  // Exact approved PR branch: manual signing validation only, never upload.
  const buildOnlyRef = env.GITHUB_REF === 'refs/heads/ci/google-play-internal-drafts' && !requested;
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Set an X.Y.Z app.json version first');
  if (config.expo.android?.package !== 'com.reallyenglish.listenup') throw new Error('Unexpected Android package');
  if (env.GITHUB_EVENT_NAME === 'push') {
    if (env.GITHUB_REF !== `refs/tags/v${version}`) throw new Error('Release tag must exactly match app.json version');
  } else if (env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || (env.GITHUB_REF !== 'refs/heads/main' && !buildOnlyRef)) {
    throw new Error('Uploads require main; signing validation permits only the exact approved PR branch');
  }
  const integer = (value, name) => {
    if (!/^[1-9]\d*$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) throw new Error(`Invalid ${name}`);
    return Number(value);
  };
  // Workflow-local run counters reset when workflows move or are renamed.
  // The release owner selects an unused code after checking Play Console.
  const code = integer(env.PLAY_VERSION_CODE, 'version code (set the explicit version_code input or PLAY_VERSION_CODE variable)');
  if (!Number.isSafeInteger(code) || code > 2100000000) throw new Error('Version code exceeds Play limit');
  if (requested && env.PLAY_UPLOAD_ENABLED !== 'true') throw new Error('Enable PLAY_UPLOAD_ENABLED only after first-upload/API/SDK setup; manual build-only remains available');
  return { version, versionCode: code, upload: requested };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = releaseMetadata(process.env, JSON.parse(readFileSync('app.json', 'utf8')));
  appendFileSync(process.env.GITHUB_ENV, `PLAY_VERSION_CODE=${result.versionCode}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${result.version}\nversion_code=${result.versionCode}\nupload=${result.upload}\n`);
  console.log(`ListenUp ${result.version}, versionCode ${result.versionCode}, internal draft upload=${result.upload}`);
}
