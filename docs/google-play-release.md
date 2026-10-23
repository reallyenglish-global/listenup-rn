# ListenUp: main-only signed Google Play releases

Repository: `reallyenglish-global/listenup-rn`. Android package: `com.reallyenglish.listenup`.

## Safety and prerequisites

The signed workflow runs **only by manual dispatch on `main`**. Pushes, tags and PRs do not build/sign/upload releases. Both jobs check the main ref, and the metadata policy independently rejects other refs/events. Application/preview CI still runs on PRs so workflow changes can be checked before merge. Merging does **not** authorize or trigger a Play upload.

Before uploading:

1. Check the intended Play Console app, first manual AAB upload, listings, declarations, Play App Signing enrolment, and package identity. Numeric Console IDs are not Publisher API track names.
2. Verify that the dedicated upload key certificate matches Play Console and has a secure recoverable backup. Never rotate another app's key or expose private keys/passwords in Git, chat or artifacts.
3. Confirm app-specific release permissions for the service account; production release permission is needed only for an explicitly authorized production run. Prior read-only API access does not prove upload/write authority. Do not grant billing/admin or unrelated Cloud IAM roles.
4. Restrict the `google-play` environment to exact branch `main`, remove any legacy signing-validation exception, and consider required reviewers before secrets become available. This code change does not modify environment settings or permissions.
5. Verify Actions capacity and a fresh signed native candidate, including physical-device/audio testing. CI policy tests alone do not prove Play acceptance.

## Configuration

Configure these **environment secrets** in `google-play`:

- `PLAY_KEYSTORE_BASE64`: one-line base64 upload keystore, not a debug keystore.
- `PLAY_STORE_PASSWORD`, `PLAY_KEY_ALIAS`, `PLAY_KEY_PASSWORD`.
- `PLAY_SERVICE_ACCOUNT_JSON`: complete authorized service-account JSON, used only in the upload job.

Never print values. Signing material is decoded into runner temp with mode 0600 and removed on script exit; runners are ephemeral. Artifacts contain the signed AAB, checksum, source/version metadata and public certificate fingerprint, not private signing material.

Set environment variable `PLAY_UPLOAD_ENABLED` to exactly `true` only after first-upload/bootstrap, signing, API permissions and target API setup are complete. Requested uploads fail while unset; build-only is still available. This change does not enable the variable or grant permissions.

Every dispatch requires an explicit `version_code`: an unused positive decimal integer at most 2,100,000,000, **greater than every code previously uploaded across all Play tracks and drafts**. Inspect Play Console before selecting it. The helper validates syntax, not global availability; workflow counters cannot safely allocate codes. The former tag variable `PLAY_VERSION_CODE` and release tags are no longer used to trigger releases.

## Run the workflow

Open **Actions → Google Play signed release → Run workflow**, selecting **main**:

- `version_code`: the checked unused Android versionCode.
- `upload`: defaults to `false` (build-only).
- `track`: `internal` for testing (default), or `production` for public release.
- `status`: `draft` (default, save for review), or `completed` (submit full rollout).
- `confirm_release`: defaults to `false`; must be explicitly `true` for an uploaded `completed` release on either track.

### Build-only / first manual upload

Leave `upload=false`. Download the signed non-debug **AAB**, `SHA256SUMS` and `release.json` from the run artifact (14-day retention). Check package/version/target/certificate/hash before a first manual upload. Track/status inputs do not publish anything when upload is false.

The **Android APK** workflow also supports dispatch on main with `signed_bundle=true` and `version_code`; its reusable call is build-only (`upload=false`) and defaults to internal/draft metadata. Preview APK builds do not need a version code. Non-main signed calls are skipped and cannot access signing secrets.

### Internal testing

Choose `upload=true`, `track=internal`, `status=draft` to save a candidate without starting rollout. To submit to configured testers, choose `status=completed` and `confirm_release=true`. Confirm tester lists, distribution and release notes in Play Console separately. The workflow does not manage tester access.

### Production release

Only after explicit release approval and successful testing, choose `upload=true`, `track=production`. `status=draft` saves for review; `status=completed` with `confirm_release=true` submits a **full production rollout**, not a staged percentage. Defaults never select production or publish. A completed API status does not prove review approval, immediate store availability or device acceptance; Play review and managed publishing can delay delivery. Do not run production merely to validate this workflow.

Drafts set `changesNotSentForReview=true`; completed submissions set it to false. The workflow does not retry with a different review flag or silently change the requested destination/status.

## Verification and troubleshooting

- Both signing and upload jobs use the `google-play` environment. Actions are SHA-pinned. Workflow, action and native dependency changes are part of the release trust boundary.
- The built AAB manifest is checked for package, versionName/versionCode, debug/test-only flags and target API (uploads require API 36+). `jarsigner` verifies the signature/certificate and checksum-pinned bundletool validates the archive.
- The upload job downloads only the artifact from its own run and checks its SHA256 against a separate build-job output. A fresh Play API edit reads back the **selected track, exact status, versionCode and server-side bundle SHA256**; that verification edit is deleted without committing it.
- Upload success/readback is distinct from Play review, installed-device functionality and public availability. No live upload is exercised as part of PR CI.
- Releases are serialized and in-progress runs are not cancelled. GitHub allows one running/one pending in a concurrency group, not a durable queue: submit runs one at a time and wait for completion.
- After an ambiguous upload/readback/network failure, inspect Play Console before retrying. A release may already have committed. A rerun retains its versionCode and can fail with a duplicate; start a newly authorized dispatch with a fresh checked code if another bundle is needed. There is no automatic rollback, promotion or edit retry.
- A review-flag error requires inspecting the app's review state, not an automatic toggle/retry. API 403 requires checking app-specific permissions, API enablement and bootstrap; Cloud IAM alone is insufficient.
- Signing mismatch: recover the intended key or follow Google's approved reset procedure; never switch identity silently.
- Expo 54 / RN 0.81.5 use API 36, build-tools 36.0.0 and NDK 27.1.12297006. TrackPlayer 4.x requires the explicit legacy architecture, Reanimated 3.19.x pin and committed Kotlin nullable-item patch. Do not blindly install Reanimated 4 or remove these compatibility constraints.

Local checks (no Play writes or signing secrets):

```sh
node --test scripts/tests/play-release.test.mjs
python3 -m unittest discover -s scripts/tests -p 'test_*.py'
shellcheck scripts/build-play-bundle.sh
bash -n scripts/build-play-bundle.sh
actionlint .github/workflows/google-play.yml .github/workflows/android-apk.yml
pnpm exec jest --ci --runInBand
```

Policy/readback fixtures are synthetic tests, not evidence of a real Play upload. A separately authorized main dispatch is needed to verify the full signed-build/upload path.
