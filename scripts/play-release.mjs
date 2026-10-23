import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function releaseMetadata(env, config) {
  if (env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || env.GITHUB_REF !== 'refs/heads/main') {
    throw new Error('Signed Play builds and uploads require manual dispatch on main');
  }
  const version = config.expo.version;
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Set an X.Y.Z app.json version first');
  if (config.expo.android?.package !== 'com.reallyenglish.listenup') throw new Error('Unexpected Android package');
  const requested = env.PLAY_UPLOAD_REQUESTED === 'true';
  const track = env.PLAY_TRACK || 'internal';
  const status = env.PLAY_STATUS || 'draft';
  if (!['internal', 'production'].includes(track)) throw new Error('Invalid Play track');
  if (!['draft', 'completed'].includes(status)) throw new Error('Invalid Play release status');
  if (requested && status === 'completed' && env.PLAY_CONFIRM_RELEASE !== 'true') {
    throw new Error('Publishing to testers or production requires confirm_release=true');
  }
  // Workflow-local run counters reset; select an unused code after checking Play Console.
  const value = env.PLAY_VERSION_CODE;
  if (!/^[1-9]\d*$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) throw new Error('Invalid version code (set explicit version_code input)');
  const code = Number(value);
  if (code > 2100000000) throw new Error('Version code exceeds Play limit');
  if (requested && env.PLAY_UPLOAD_ENABLED !== 'true') throw new Error('Enable PLAY_UPLOAD_ENABLED only after first-upload/API/SDK setup; manual build-only remains available');
  return { version, versionCode: code, upload: requested, track, status };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = releaseMetadata(process.env, JSON.parse(readFileSync('app.json', 'utf8')));
  appendFileSync(process.env.GITHUB_ENV, `PLAY_VERSION_CODE=${result.versionCode}\n`);
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${result.version}\nversion_code=${result.versionCode}\nupload=${result.upload}\ntrack=${result.track}\nstatus=${result.status}\n`);
  console.log(`ListenUp ${result.version}, versionCode ${result.versionCode}, upload=${result.upload}, track=${result.track}, status=${result.status}`);
}
