# ListenUp: signed Google Play internal drafts

Repository: `reallyenglish-global/listenup-rn`. Android application ID: `com.reallyenglish.listenup`.

This workflow is **prepared, not enabled or release-verified**. It adds no production rollout and does not change the existing preview APK workflow. Native signed AAB execution and Play API access still require the setup below. The Console app/track numeric IDs in browser links are **not** Android package names or Publisher API track identifiers. Confirm this Console app is intended for this package before its first upload; package identity becomes fixed.

## Current blockers / first-time setup

1. **Upgrade the Android toolchain deliberately.** Current main uses Expo 51 / RN 0.74.5 and Android API 34. Google requires target API **36** for new mobile apps and updates from August 31, 2026. The workflow intentionally refuses API upload below 36. Manual build-only can still produce an API-34 artifact, but that is **not evidence of Play acceptance**. Upgrade Expo/RN/native dependencies and the workflow's SDK/build-tools/NDK packages together, validate audio/router behaviour on an Android device, and build a compatible AAB. Do not just set a higher targetSdk override. See [Google's live policy](https://support.google.com/googleplay/android-developer/answer/11926878).
2. **Confirm signing ownership.** Use an existing registered upload key if one exists. Otherwise create and securely back up an Android upload key outside the repository, then enrol through Play App Signing. Never rotate or replace an established key merely for CI. Google holds the separate app-signing key when Play App Signing is enabled. Do not send private keys/passwords in Telegram, issue comments or PRs.
3. **Bootstrap in Play Console.** Complete required app setup/agreements, listings, content/data-safety declarations and app-signing enrolment. Upload the first compatible signed AAB manually to the intended internal-testing track. Download a manual build-only workflow artifact after the toolchain upgrade. An app shell alone does not prove Publisher API bootstrap is complete. Check the upload certificate and package agree with CI before continuing. Do not submit or roll out to production as part of setup.
4. **Set up the API service account.** In a Google Cloud project enable Google Play Android Developer API, create a dedicated CI service account and invite its email in Play Console Users and permissions. Restrict app access to ListenUp; grant only viewing and release-to-testing permissions needed for internal drafts (not production, financial or account-admin permissions). Store its service-account JSON using the GitHub secret UI/approved secret manager, never in this repo. Google Cloud Editor/Owner alone is not Play app permission. If service-account key creation is prohibited by organization policy, stop and design approved Workload Identity Federation instead of bypassing policy.
5. **GitHub environment.** BEFORE adding secrets, create `google-play` in this repo with deployment branch/tag rules limited to `main` and protected `v*` tags; restrict who may create tags/update workflows. These external controls are mandatory: a malicious workflow could otherwise remove its own ancestry checks. Configure required reviewers if you want human approval before jobs access keys (build and upload each reference the environment). Workflows are SHA-pinned; changes to workflows/actions still require review. Native build dependencies execute in the signing process tree; dependency updates are also part of the release trust boundary.
6. **Actions capacity.** Confirm the organization has Actions budget/capacity. A run that cannot start due to billing is not passing CI. This automation does not change billing, branch protection or repository settings.

## Secret and variable names

Put these **environment secrets** in `google-play`:

- `PLAY_KEYSTORE_BASE64`: base64-encoded upload keystore, **one line** (for example `base64 -w 0 /secure/path/upload.jks` on Linux, redirect output to a private file rather than terminal/chat). No debug keystore.
- `PLAY_STORE_PASSWORD`: keystore password.
- `PLAY_KEY_ALIAS`: upload-key alias.
- `PLAY_KEY_PASSWORD`: upload-key password.
- `PLAY_SERVICE_ACCOUNT_JSON`: complete dedicated service-account JSON, used only by the upload job.

Secret existence is checked without printing values. The keystore is decoded with mode 0600 in runner temp only for signing and removed on script exit; runners are ephemeral. No keystore/password/JSON enters artifacts or Gradle build cache. Do not add secrets to `app.json`, `.env`, Gradle properties, Git, command arguments or logs.

Environment variables:

- `PLAY_VERSION_CODE_BASE`: optional positive integer; defaults to `1000000`. Version code is `base + github.run_number * 100 + github.run_attempt` (attempt <=99), capped at 2,100,000,000. Before first automated release, choose a base making the result larger than **every version code already uploaded**. Keep the workflow identity and base stable. Older-run reruns can have a lower code than a newer run: Play should reject them; start a new run instead. Re-running after a successfully committed upload uses a fresh version code and creates or replaces the internal draft; inspect Play Console first after an ambiguous network failure.
- `PLAY_UPLOAD_ENABLED`: leave unset for bootstrap; set to exactly `true` **only after** first compatible upload, API permissions and target-API checks are complete. Requested uploads (including tags) fail clearly while unset; they do not silently report success without uploading. Manual build-only remains available.

## Use

### Manual build-only (first upload / diagnosis)

After reviewed code is merged to `main`, open **Actions → Google Play internal draft → Run workflow**, choose **main**, leave `upload=false`. It builds a signed non-debug **AAB**, not an APK, and saves `listenup.aab`, `SHA256SUMS` and `release.json` for 14 days. Download the artifact and verify its SHA256; inspect version/target/package/certificate before first manual upload. A successful API-34 build is not a store-ready build.

### Automatic tag → internal draft

Update `expo.version` in `app.json` through a tested/reviewed change on main, then create a matching tag such as `v1.0.0` on the intended main commit. Only `vX.Y.Z` matching that version is accepted; prerelease and mismatched tags fail. Tag creation/push requires release approval. Once configuration and compatible tooling are ready, the run builds/signs/verifies, uploads exactly to Publisher API `internal` with `status: draft` and `changesNotSentForReview: true`, then opens a fresh edit to read back that exact version as an internal draft and deletes the verification edit **without committing it**.

Nothing is published to testers or production automatically. Finish reviewing the draft and release notes in Play Console; any rollout is a separate human action. Do not run the workflow against a different numeric Console track expecting it to change API `internal`.

Manual `upload=true` does the same draft upload with a new generated version code, from main only. No arbitrary-ref input, pull-request deployment or production-track selector exists.

## Verification / troubleshooting

- Package, versionName, versionCode, debug/test-only flags and upload target API are read from the **built AAB manifest**, not assumed from source config.
- `jarsigner` verifies the actual AAB signature and its certificate is checked against the upload key. Checksum-pinned Google bundletool validates the archive.
- Signed artifact and SHA256 are passed between build/upload jobs from the same run; the expected hash is a separate build-job output. The Play readback verifies both internal-draft versionCode and the server's bundle SHA256. Release metadata records source SHA and public upload certificate fingerprint, never private material.
- Upload job is serial; in-progress releases are not cancelled by newer tags. GitHub concurrency allows one running/one pending per group; a newer request can replace a pending one. This is **not a durable queue** guaranteeing every rapid tag uploads. Create release tags one at a time and wait for completion.
- Draft/readback failure: inspect Play Console before retrying; an upload may already have committed even if verification/network failed. There is no automatic production promotion, edit retry or version-code rollback.
- Re-running only a failed upload job reuses its original build artifact and versionCode, not the retry's artifact name. If Play already committed that version, it can reject re-upload. Inspect first; a full rerun mints a fresh versionCode and can create or replace the internal draft.
- If Play says `changesNotSentForReview must not be set`, stop and inspect that app's review mode. The flag is deliberately true here; do not automatically toggle it or retry a potentially committed release. Adjust only through a reviewed workflow change for the confirmed app state.
- API 403: check app-specific Play permissions, API enablement and first manual upload; Cloud IAM roles alone are insufficient.
- Signing mismatch: stop and recover the existing upload key or use Google's approved upload-key reset process. Never silently switch signing identities.
- Upgrade native SDK packages together with Expo. This patch intentionally keeps the existing known preview-native baseline rather than bundling an untested SDK migration.

Local checks (do not contact Play or require signing secrets):

```sh
node --test scripts/tests/play-release.test.mjs
python3 -m unittest discover -s scripts/tests -p 'test_*.py'
shellcheck scripts/build-play-bundle.sh
bash -n scripts/build-play-bundle.sh
actionlint .github/workflows/google-play.yml
pnpm exec jest --ci --runInBand
PLAY_VERSION_CODE=1001001 pnpm exec expo config --type public
```

Tests use explicit synthetic policy fixtures, not fabricated Play results. Passing these is not proof of a signed native build, Play acceptance or a device test. Live upload/readback is intentionally not exercised until credentials, package, signing ownership and release authority are supplied.
