# Request upload approval for a retained ListenUp AAB

This is a separate **upload-only** path. It does not rebuild an app, read private
app-signing/upload-key keystores, change a signed bundle's version, or automatically enable Play
publishing. Destination is fixed to **internal testing / draft** with
`changesNotSentForReview=true`: no tester rollout or public production rollout.
The existing build-and-upload workflow remains unchanged.

This conservative path is for an **empty internal track only**. Once any draft
or completed release exists there, it will refuse later uploads rather than
replace that release list. Updating a populated track is a separate workflow
change/Console decision, not a hidden overwrite option.

## Owner setup and publication gates

Before this option appears/runs, review/merge this change into the default branch
and separately promote the approved code to `production`. This document is not
approval to merge, promote or dispatch. Never bypass the production source rule
by changing the environment's branch allowlist.

Keep the existing `google-play` environment's required human reviewer and
production-only policy. `PLAY_UPLOAD_ENABLED` remains a separate readiness switch.
Do not set it to true until first-upload/bootstrap, app declarations, app signing,
registered upload certificate, Publisher API permissions and target API readiness
are confirmed. Environment approval does not override this switch. Preparation
can produce the approval summary without publisher credentials; after approval,
a disabled switch causes failure **before any Play write**.

## Request procedure

1. Open **Actions → Request Play upload approval (retained AAB) → Run workflow**.
2. Select **production**. Feature/main/tag/PR dispatches cannot access this path.
3. Supply:
   - `source_run_id`: a successful manual **Google Play signed release** run on
     production (not a preview/reusable caller or an arbitrary artifact producer).
   - `source_artifact_id`: the exact unexpired artifact ID from that source run's
     latest build attempt.
   - `expected_aab_sha256`: independently selected AAB SHA256, 64 lowercase hex.
   - `expected_version_code`: the code already embedded in that AAB.
   - `expected_upload_key_sha256`: upload-certificate SHA256 checked against
     **Play Console's upload key**, not Google's separate app-signing key; use
     64 lowercase hex characters without colons.
   - `console_max_version_code`: the freshly checked maximum used code across
     every Play track/draft; use 0 only when Console confirms no previous codes.
   - Check `request_internal_draft` only to request approval for that exact bundle.
4. The credential-free preparation job checks repository/run/workflow/ref/attempt
   provenance, successful signed-build evidence, production ancestry, file
   inventory, source/version/hash metadata, actual signature/certificate and
   actual package/version/target/debug/test-only manifest fields. Its selected
   bundle is copied unchanged with a request-bound receipt into this request run.
5. Read the preparation summary: source run/artifact/SHA, exact AAB hash,
   versionName/code/API, certificate, human-attested Console maximum and fixed
   internal/draft destination. The Console maximum is **not automatically read**.
6. In the same run, choose **Review deployments → google-play → Approve and deploy**
   only if these are the intended exact values. Reject the deployment otherwise.
   The agent must not approve for the owner or bypass reviewer protections.
7. The approved job rechecks the readiness switch, request/receipt hash, same-run
   prepared AAB, actual signature and embedded identity before reading Publisher
   credentials. It opens an owned uncommitted inspection edit and requires the
   internal track to have **no existing releases or drafts**. Otherwise it deletes
   only that owned edit and stops before uploading the AAB. The publisher reuses
   that same checked edit, avoiding replacement of an existing tester release.
   It uploads only an internal draft, then reads back the exact
   versionCode, track/status and server-side AAB checksum through Play API.

The workflow shares `listenup-google-play` serialization with the existing
release workflow. An approval wait holds that release group; GitHub may replace
an older pending run with a newer pending run even with cancel-in-progress=false.
Submit one request at a time. A GitHub artifact upload during
preparation is not a Google Play upload. Verification passes are not installed
app/audio acceptance or Play review/store availability.

## Current retained build example — identity, not upload authorization

Run `41414501966`, artifact ID `13157552138`:

- Source SHA: `28f3603062b51706e48ad440893f51c5f0148655`.
- Display `2026.1`; embedded versionCode `3`; target API 36.
- AAB SHA256: `6802658f744ff9e5fa65483266656c370498bbc651643163dad84508f2d36f30`.
- Built public upload-certificate SHA256:
  `c3ca90c3d552c93aec972616833c27db0d8ba64a51dd83778010d61075e2a765`.

Read-only inspection of that real retained bundle passed during development.
This does **not** confirm current Console code availability, registered Console
certificate, API write authority or permission to upload it. Artifacts expire.
Code 3 is accepted only if the freshly checked Console maximum is below 3; it
cannot be changed to a larger code without producing a newly signed AAB.

## Rejections and recovery

- Wrong workflow/repository/ref/source/attempt, failed build, expired artifact,
  checksum/source/version/signer/manifest mismatch, extra/symlink files or invalid
  literals stop preparation. Do not normalize or substitute inputs to bypass it.
- The receipt binds the exact request run, workflow SHA and attempt; rerunning
  only the upload job cannot silently reuse an earlier attempt's approval data.
- If an upload or readback result is ambiguous, inspect Play Console before any
  retry. The edit may already have committed; there is no automatic retry,
  rollback, promotion, alternate review flag or destination change.
- Human rejection causes no Play write. Workflow cancellation does not imply a
  rollback if a separately approved Play edit has already committed.
- Publisher readiness stays disabled until separately authorized and configured.
- Existing internal releases/drafts require a separately reviewed preservation
  strategy or manual Console handling; there is no force/overwrite switch here.

## Local checks (no publisher writes)

```sh
python3 -m unittest discover -s scripts/tests -p 'test_*.py'
node --test scripts/tests/play-release.test.mjs
actionlint .github/workflows/google-play-upload.yml
pnpm exec jest --ci --runInBand
```

Tests with generated inputs/command fixtures check policy and wiring, not human
approval or a real upload. A production approval/Play upload is intentionally not
performed as part of local or PR verification.
